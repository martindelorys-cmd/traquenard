import { Stack } from 'expo-router';

// On intercepte les erreurs globales asynchrones (comme le 404 des icônes) 
// pour empêcher le navigateur de bloquer le JavaScript
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('NetworkError')) {
      console.warn('NetworkError interceptée au démarrage (police manquante ignorée).');
      event.preventDefault(); // Empêche le crash global "Uncaught in promise"
    }
  });
}

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}