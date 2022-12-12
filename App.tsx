import { NativeBaseProvider, StatusBar, Text } from 'native-base';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';

import { AuthContextProvider } from '@contexts/AuthContext';

import { Routes } from '@routes/index';

import { THEME } from './src/theme';
import { Loading } from '@components/Loading';

export default function App() {

  
  const [ fontsLoaded ] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  return (
    <NativeBaseProvider theme={THEME} >
      <StatusBar barStyle='light-content' backgroundColor='transparent' translucent />

      <AuthContextProvider>
        { fontsLoaded ? <Routes /> : <Loading /> }
      </AuthContextProvider>

    </NativeBaseProvider>
  );
}