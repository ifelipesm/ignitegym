import { VStack,Image,Text ,Center, Heading, ScrollView, useToast } from "native-base";
import BackgroundImg  from '@assets/background.png'
import  LogoSvg  from '@assets/logo.svg'
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'

import { api } from '@services/api'
import { AppError } from "@utils/AppError";
import { useState } from "react";
import { useAuth } from "@hooks/useAuth";

type FormDataProps = {
  name:string;
  email: string;
  password: string;
  password_confirm: string;
}

const signUpSchema = yup.object({
  name: yup.string().required('Informe o nome'),
  email: yup.string().required('Informe o e-mail').email('E-mail inválido'),
  password: yup.string().required('Informe a senha').min(6,'Mínimo de 6 caracteres'),
  password_confirm: yup.string().required('Confirme a senha').oneOf([yup.ref('password')],'As senhas devem coincidir'),
});

export function SignUp(){
  const [isLoading,setIsLoading] = useState(false);

  const toast = useToast();
  const { signIn } = useAuth();

  const { control, handleSubmit, formState: {errors} } = useForm<FormDataProps>({
    resolver: yupResolver(signUpSchema),
  });
  
  const navigation = useNavigation();

 async function handleSignUp({name,email,password}: FormDataProps){
    try{
      setIsLoading(true);
      await api.post('/users',{name,email,password});
      await signIn(email,password)

      toast.show({
        title:'Conta criada com sucesso!',
        placement:'top',
        bgColor: 'green.500'
      });

    } catch(error){
      setIsLoading(false);

      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível criar a conta. Tente novamente mais tarde.'
      
      toast.show({
        title,
        placement:'top',
        bgColor: 'red.500'
      });
    }

  }

  function handleGoBack(){
    navigation.goBack();
  }
  
  return (
    <ScrollView 
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{flexGrow: 1}} >

    <VStack flex={1} px={10} >
      <Image
        defaultSource={BackgroundImg}
        source={BackgroundImg}
        alt="Pessoas treinando"
        resizeMode="contain"
        position="absolute"
      />
      
      {/* header */}
      <Center my={24}>  
        <LogoSvg  /> 
        <Text color="gray.100"  fontSize="sm" fontFamily="heading" >
        Treine sua mente e o seu corpo  
        </Text> 
      </Center>

      {/* Text Input */}
      <Center>
        <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
          Crie sua conta
        </Heading>

        <Controller
          control={control}
          name="name"
          render={({field: { onChange,value }})=> (
            <Input 
              placeholder="Nome"
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
              onChangeText={onChange}
              value={value}
              errorMessage={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({field: { onChange,value }})=> (
            <Input 
              onChangeText={onChange}
              value={value}
              secureTextEntry
              placeholder="Senha"
              errorMessage={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password_confirm"
          render={({field: { onChange,value }})=> (
            <Input 
              onChangeText={onChange}
              value={value}
              secureTextEntry
              placeholder="Confirme a senha"
              errorMessage={errors.password_confirm?.message}
              onSubmitEditing={handleSubmit(handleSignUp)}
              returnKeyType="send"
            />
          )}
        />

        <Button 
          title="Criar e acessar" 
          onPress={handleSubmit(handleSignUp)}
          isLoading={isLoading}
        />

      </Center>
   
      <Button 
      onPress={handleGoBack}
      mt={12}
      variant="outline" 
      title="Voltar para o login" />

    </VStack>
    </ScrollView>
  )
}