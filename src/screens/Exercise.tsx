import { Heading,HStack,Icon,Text, VStack,Image, Box, ScrollView, useToast } from "native-base";
import { TouchableOpacity } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";

import BodySvg from '@assets/body.svg';
import SeriesSvg from '@assets/series.svg';
import RepetitionsSvg from '@assets/repetitions.svg';
import { Button } from "@components/Button";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { useEffect, useState } from "react";
import { Loading } from "@components/Loading";

type RoutesParamsProps = {
  exerciseId: string;
}

export function Exercise(){
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [exercise,setExercise] = useState<ExerciseDTO>({} as ExerciseDTO);

  const navigation = useNavigation<AppNavigatorRoutesProps>();

  const route = useRoute();
  const toast = useToast();

  const { exerciseId } = route.params as RoutesParamsProps


  async function handleExerciseHistoryRegister(){
    try{
      setIsSubmiting(true);
      await api.post('/history', { exercise_id: exerciseId });

      toast.show({
        title: 'Exercício registrado no histórico.',
        placement: 'top',
        bgColor: 'green.700'
      });

      navigation.navigate('history');

    }
    catch(error){
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível registrar o exercício.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      });
    }
    finally{
      setIsSubmiting(false);
    }
  }

  function handleGoBack(){
    navigation.goBack();
  }

  async function fetchExerciseDetails(){
    try{
      setIsLoading(true);
      const response = await api.get(`/exercises/${exerciseId}`)
      setExercise(response.data);
    }
    catch(error){
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível carregar o exercício.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      });
    }
    finally{
      setIsLoading(false);
    }
  }

  useEffect(()=>{
    fetchExerciseDetails();
  },[exerciseId])

  return (

    <VStack flex={1}>
      <VStack px={8} bg="gray.800" pt={12} >
        <TouchableOpacity onPress={handleGoBack} >
          <Icon as={Feather} name="arrow-left" color="green.500" size={6} />
        </TouchableOpacity>

        <HStack justifyContent="space-between" mt={4} mb={8} alignItems="center" >
          <Heading color="gray.100" fontFamily={"heading"} fontSize="lg" flexShrink={1} >
            {exercise.name}
          </Heading>
          <HStack alignItems="center">
            <BodySvg/>
            <Text color="gray.200" ml={1} textTransform="capitalize" >
              Costas
            </Text>
          </HStack>
        </HStack>
      </VStack>

      {isLoading ? <Loading /> : 
        <ScrollView>
          <VStack p={8}>
            <Box rounded="lg" mb={3} overflow="hidden" >
              <Image
                w="full"
                h={80}
                source={{uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}`}}
                alt="Nome do exercício"
                resizeMode="cover"
              />
            </Box>
            <Box bg="gray.600" rounded="md" pb={4} px={4} >
              <HStack alignItems="center" justifyContent="space-around" mb={6} mt={5} >
                <HStack>
                  <SeriesSvg/>
                  <Text color="gray.200" ml="2" >
                    {exercise.series} séries
                  </Text>
                </HStack>
                <HStack>
                  <RepetitionsSvg/>
                  <Text color="gray.200" ml="2" >
                    {exercise.repetitions} repetições
                  </Text>
                </HStack>
              </HStack>
              <Button isLoading={isSubmiting} onPress={handleExerciseHistoryRegister} title="Marcar como realizado"/>
            </Box>
          </VStack>
        </ScrollView>
      }
    </VStack>


  )
}