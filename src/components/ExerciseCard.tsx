import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { VStack, HStack, Heading, Text, Image, Icon } from 'native-base';

import { Entypo } from '@expo/vector-icons';

import { api } from '@services/api';
import { ExerciseDTO } from '@dtos/ExerciseDTO';

type Props = TouchableOpacityProps & {
    data: ExerciseDTO;
}

export function ExerciseCard({ data, ...rest }: Props) {
    return (
        <TouchableOpacity {...rest}>
            <HStack bg='gray.500' alignItems='center' p={2} rounded='md' mb={3}>
                <Image 
                    source={{ uri: `${api.defaults.baseURL}/exercise/thumb/${data.thumb}` }} 
                    alt='Imagem do exercício' 
                    w={16}
                    h={16}
                    rounded='md'
                    mr={4}
                    resizeMode='cover'
                />

                <VStack flex={1}>
                    <Heading fontSize='lg' color='white' numberOfLines={1} fontFamily='heading'>{data.name}</Heading>
                    <Text fontSize='sm' color='gray.200' numberOfLines={2}>{`${data.series} séries x ${data.repetitions} repetições`}</Text>
                </VStack>

                <Icon as={Entypo} name='chevron-thin-right' color='gray.300' ml={1}/>
            </HStack>
        </TouchableOpacity>
    );
}