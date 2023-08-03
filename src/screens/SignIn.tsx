import { VStack,Image,Text ,Center, Heading, ScrollView, useToast } from "native-base";
import BackgroundImg  from '@assets/background.png'
import  LogoSvg  from '@assets/logo.svg'
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigatorRoutesProps } from "@routes/auth.routes";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import { AppError } from "@utils/AppError";
import { useState } from "react";

type FormData = {
  email: string;
  password: string;
}

export function SignIn(){
  const [isLoading,setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const navigation = useNavigation<AuthNavigatorRoutesProps>();
  const toast = useToast();

  const { control, handleSubmit, formState: {errors} } = useForm<FormData>();

  function handleNewAccount(){
    navigation.navigate('signUp');
  }

  async function handleSignIn({email,password}: FormData){
    
    try{
      setIsLoading(true);
      await signIn(email,password);
    } catch(error){
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível acessar. Tente novamente mais tarde.'
      setIsLoading(false);
      toast.show({
        title,
        placement:'top',
        bgColor: 'red.500'
      });
    }

  }

  return (
    <ScrollView 
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{flexGrow: 1}} >

    <VStack flex={1} px={10} >
      <Center>

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
          <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
            Acesse sua conta
          </Heading>

         
        <Controller
          control={control}
          name="email"
          rules={{required: 'Informe o e-mail'}}
          render={({field: { onChange }})=> (
            <Input 
              placeholder="E-mail"
              keyboardType="email-address"
              onChangeText={onChange}
              errorMessage={errors.email?.message}
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{required: 'Informe a senha'}}
          render={({field: { onChange }})=> (
            <Input 
              onChangeText={onChange}
              secureTextEntry
              placeholder="Senha"
              errorMessage={errors.password?.message}
            />
          )}
        />

        <Button 
        isLoading={isLoading}
        title="Acessar" 
        onPress={handleSubmit(handleSignIn)} />

      </Center>

    <Center mt={24}>
      <Text 
      color="gray.100"
      fontSize="sm"
      mb={3}
      fontFamily="body"
      >
        Ainda não tem acesso?
      </Text>
      <Button 
      onPress={handleNewAccount}
      variant="outline" 
      title="Criar Conta" 
      />
    </Center>

    </VStack>
    </ScrollView>
  )
}