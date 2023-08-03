import { Heading, HStack,Image, VStack, Text, Icon } from "native-base";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import {Entypo} from '@expo/vector-icons';
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { api } from "@services/api";



type Props = TouchableOpacityProps & {
name:string;
exercise: ExerciseDTO;
};

export function ExerciseCard({name,exercise,...rest}:Props){
  return(
    <TouchableOpacity {...rest} >
      <HStack bg="gray.500" alignItems="center" p={2} pr={4} rounded="md" mb={3} >
        <Image
        source={{uri: `${api.defaults.baseURL}/exercise/thumb/${exercise.thumb}`}}
        alt="Exercício"
        w={16}
        h={16}
        rounded="md"
        mr={4}
        resizeMode="cover"
        />
        <VStack flex={1}>
          <Heading fontSize="lg" color="white" fontFamily={"heading"}>
            {name}
          </Heading>
          <Text fontSize="sm" color="gray.200" mt={1} numberOfLines={2}>
            {exercise.series} Séries x {exercise.repetitions} Repetições
          </Text>
        </VStack>

        <Icon as={Entypo} name="chevron-thin-right" color="gray.300" />
      </HStack>
    </TouchableOpacity>
  )
}