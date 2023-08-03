import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { VStack,Text, ScrollView, Center, Skeleton, Heading, Alert, useToast } from "native-base";
import { useContext, useState } from "react";
import { TouchableOpacity } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as yup from 'yup'
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@hooks/useAuth";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import defaultUserPhotoImg from '@assets/userPhotoDefault.png';


const PHOTO_SIZE = 33;


type FormDataProps = {
  name:string;
  email: string;
  old_password: string;
  password: string;
  confirm_password: string;
}

const profileSchema = yup.object({
  name: yup.string().required('Informe o nome'),
  
  password: yup.string()
  .min(6,'Mínimo de 6 caracteres').nullable()
  .transform((value) => !!value ? value : null),
  
  confirm_password: yup.string()
  .nullable()
  .transform(value => value || null)
  .oneOf([yup.ref('password'), null], 'As senhas devem coincidir.')
  .when('password', {
    is: (field: string) => field,
    then: (schema) => schema.nullable().transform((value) => !!value ? value : null).required('Confirme a senha.'),
  })
});

export function Profile(){
  const [updating,setUpdating] = useState(false);
  const [photoIsLoading,setPhotoIsLoading] = useState(false);
  
  const toast = useToast();
  const { user,updateUserProfile } = useAuth(); //Pegando dados do context

  const { control,  handleSubmit, formState:{errors} } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: yupResolver(profileSchema)
  });

 async function handleUpdateProfile(data: FormDataProps){
    try{
      setUpdating(true);

      const userUpdated = user; //dados de usuário do context
      userUpdated.name = data.name;

      await api.put('/users',data); // enviando dados pra rota
      await updateUserProfile(userUpdated); // função do context
      
      toast.show({
        title: 'Perfil atualizado com sucesso.',
        placement: 'top',
        bgColor: 'green.500'
      })
    } catch(error){
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível atualizar os dados. Tente novamente mais tarde.'
      
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      }) 
    }
    finally {
      setUpdating(false);
    }

  }

  async function handleUserPhotoSelect(){
    setPhotoIsLoading(true);
    try{
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect:[4,4],
        allowsEditing: true,
      });
      if(photoSelected.canceled){
        return;
      }
      if(photoSelected.assets[0].uri){
        const photoInfo  = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);
        if(photoInfo.exists && (photoInfo.size / 1024 / 1024 > 5 )) {
 
          return toast.show({
            title: 'Imagem muito grande. Escolha uma de até 5 MB.',
            placement: 'top',
            bgColor: 'red.500'
          })
          
        }
      }

      const fileExtension = photoSelected.assets[0].uri.split('.').pop();

      const photoFile = {
        name: `${user.name}.${fileExtension}`.toLowerCase(),
        uri: photoSelected.assets[0].uri,
        type: `${photoSelected.assets[0].type}/${fileExtension}`
      } as any;

      const userPhotoUploadForm = new FormData();
      userPhotoUploadForm.append('avatar', photoFile);
    
        const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        const userUpdated = user;
        userUpdated.avatar = avatarUpdatedResponse.data.avatar;
        await updateUserProfile(userUpdated);

      toast.show({
        title: 'Foto atualizada com sucesso.',
        placement: 'top',
        bgColor: 'green.500',
      })

    }
    catch(error){
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível atualizar o avatar.'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    }
    finally{
      setPhotoIsLoading(false);
    }
  }

  return (
    <VStack flex={1} >
      <ScreenHeader title="Perfil" />
      <ScrollView contentContainerStyle={{  paddingBottom: 36 }} >
        <Center mt={6} px={10}>
          {
            photoIsLoading ?  
            <Skeleton 
              w={PHOTO_SIZE} 
              h={PHOTO_SIZE} 
              rounded="full" 
              startColor="gray.500"
              endColor="gray.400"
            /> 
            :
            <UserPhoto
              source={
                user.avatar 
                ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } 
                : defaultUserPhotoImg }
              alt="User Photo"
              size={PHOTO_SIZE}
            />
          }
          <TouchableOpacity onPress={handleUserPhotoSelect} >
            <Text color="green.500" fontWeight="bold" fontSize="md" mt={2} mb={8} >
              Alterar Foto
            </Text>
          </TouchableOpacity>

        <Controller
          control={control}
          name="name"
          render={({field: { onChange,value }})=> (
            <Input 
              placeholder="Nome"
              bg="gray.600"
              onChangeText={onChange}
              value={value}
              errorMessage={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({field: { onChange,value }})=> (
            <Input 
              placeholder="E-mail"
              bg="gray.600"
              onChangeText={onChange}
              value={value}
              errorMessage={errors.email?.message}
              isDisabled={true}
            />
          )}
        />
        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading  color="gray.200" fontFamily={"heading"} fontSize="md" mb={2} alignSelf="flex-start" mt={12}>
            Alterar Senha
          </Heading>

          <Controller
            control={control}
            name="old_password"
            render={({field: { onChange,value }})=> (
              <Input 
                placeholder="Senha Antiga"
                bg="gray.600"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.old_password?.message}
                secureTextEntry
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({field: { onChange,value }})=> (
              <Input 
                placeholder="Senha Nova"
                bg="gray.600"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
                secureTextEntry
              />
            )}
          />        
          <Controller
            control={control}
            name="confirm_password"
            render={({field: { onChange,value }})=> (
              <Input 
                placeholder="Confime a senha"
                bg="gray.600"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.confirm_password?.message}
                secureTextEntry
              />
            )}
          />      

          <Button
          title="Atualizar"
          onPress={handleSubmit(handleUpdateProfile)}
          isLoading={updating}
          />
        </VStack>
      </ScrollView>
    </VStack>
  )
}