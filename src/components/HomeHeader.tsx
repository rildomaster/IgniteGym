import { HStack, VStack, Text, Heading, Icon } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { api } from '@services/api';

import { useAuth } from '@hooks/useAuth';

import { MaterialIcons } from '@expo/vector-icons'

import { UserPhoto } from './UserPhoto';

export function HomeHeader() {

    const { user, signOut } = useAuth();

    async function handleLogout() {
        await signOut();
    }

    return (
        <HStack bg='gray.600' pt={16} pb={5} px={8} alignItems='center'>

            <UserPhoto size={16} mr={4} uri={user.avatar} />
            {/* <UserPhoto size={16} mr={4} source={{ uri: 'https://github.com/rildomaster.png' }} /> */}

            <VStack flex={1}>
                <Text color='gray.100' fontSize='md'>Olá, </Text>
                <Heading color='gray.100' fontSize='md' fontFamily='heading'>{user.name}</Heading>
            </VStack>

            <TouchableOpacity onPress={handleLogout}>
                <Icon
                    as={MaterialIcons}
                    name='logout' color='gray.200' size={7}
                />
            </TouchableOpacity>

        </HStack>
    );
}