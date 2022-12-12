import { Image, IImageProps } from 'native-base';

import { api } from '@services/api';

import photoDefault from '@assets/userPhotoDefault.png';

type Props = IImageProps &{
    uri: string;
    size: number;
}

export function UserPhoto({ size, uri, ...rest }: Props) {
    return (
        <Image 
            w={size}
            h={size}
            rounded='full'
            alt='Foto do usuário'
            borderWidth={2}
            borderColor='gray.400'
            source={ uri ? { uri: `${api.defaults.baseURL}/avatar/${uri}` } : photoDefault}
            // source={ source === undefined ? photoDefault : source }
            { ...rest }
        />
    );
}