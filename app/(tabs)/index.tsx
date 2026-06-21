import { addDoc, arrayUnion, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase';

const DEFIS: Record<string, { id: number; text: string; points: number; emoji: string }[]> = {
  chill: [
    { id: 101, text: "Faire un compliment sincère à un inconnu", points: 5, emoji: "😊" },
    { id: 102, text: "Apprendre le prénom du serveur et l'utiliser", points: 5, emoji: "👋" },
    { id: 103, text: "Envoyer un message sympa à quelqu'un à qui tu penses", points: 5, emoji: "💌" },
    { id: 104, text: "Faire sourire un inconnu", points: 5, emoji: "😄" },
    { id: 105, text: "Tenir la porte à 3 personnes d'affilée", points: 5, emoji: "🚪" },
    { id: 106, text: "Dire merci avec une révérence", points: 5, emoji: "🙇" },
    { id: 107, text: "Chanter tout seul dans un lieu public 10 secondes", points: 10, emoji: "🎵" },
    { id: 108, text: "Demander l'heure à quelqu'un alors que tu as ton téléphone", points: 5, emoji: "⌚" },
    { id: 109, text: "Prendre une photo avec un inconnu", points: 10, emoji: "🤳" },
    { id: 110, text: "Faire un high five à quelqu'un que tu ne connais pas", points: 5, emoji: "🙌" },
  ],
  normal: [
    { id: 201, text: "Commander avec un faux accent étranger", points: 15, emoji: "🎭" },
    { id: 202, text: "Danser seul en pleine rue pendant 30 secondes", points: 20, emoji: "🕺" },
    { id: 203, text: "Appeler un ami et lui chanter une chanson", points: 15, emoji: "🎤" },
    { id: 204, text: "Faire 20 pompes en public", points: 20, emoji: "💪" },
    { id: 205, text: "Demander une réduction dans un fast food", points: 15, emoji: "🍔" },
    { id: 206, text: "Prendre un selfie avec un agent de sécurité", points: 20, emoji: "👮" },
    { id: 207, text: "Faire un discours de 30s dans la rue comme un politicien", points: 20, emoji: "🎙️" },
    { id: 208, text: "Commander en chantant ta commande", points: 20, emoji: "🎶" },
    { id: 209, text: "Poster une story avec une grimace horrible", points: 15, emoji: "😱" },
    { id: 210, text: "Crier que c'est ton anniversaire dans un lieu public", points: 20, emoji: "🎂" },
  ],
  chaud: [
    { id: 301, text: "Poster une photo ridicule sur tes réseaux", points: 30, emoji: "🤯" },
    { id: 302, text: "Faire un karaoké sans musique dans la rue", points: 35, emoji: "🎸" },
    { id: 303, text: "Faire une demande en mariage fictive à un inconnu", points: 50, emoji: "💍" },
    { id: 304, text: "Porter une pancarte Je cherche un ami pendant 5 min", points: 35, emoji: "📝" },
    { id: 305, text: "Faire un live Instagram de 2 minutes en faisant n'importe quoi", points: 40, emoji: "📱" },
    { id: 306, text: "Donner une étoile Michelin fictive au gérant d'un resto", points: 50, emoji: "⭐" },
    { id: 307, text: "Mettre tes habits à l'envers pour le reste de la soirée", points: 30, emoji: "👕" },
    { id: 308, text: "Sonner chez un voisin pour emprunter du sel en chantant", points: 50, emoji: "🧂" },
    { id: 309, text: "Faire 50 squats en public", points: 35, emoji: "🏋️" },
    { id: 310, text: "Appeler ta mère et lui dire que tu es amoureux d'un inconnu", points: 40, emoji: "💕" },
  ],
  bureau: [
    { id: 401, text: "Dire le mot canapé en réunion sans raison", points: 15, emoji: "🛋️" },
    { id: 402, text: "Envoyer un email en commençant par Chers amis du destin", points: 20, emoji: "📧" },
    { id: 403, text: "Poser une question totalement hors sujet en réunion", points: 20, emoji: "🙋" },
    { id: 404, text: "Utiliser le mot synergies 3 fois dans une réunion", points: 15, emoji: "💼" },
    { id: 405, text: "Applaudir la fin d'une réunion comme dans un avion", points: 20, emoji: "👏" },
    { id: 406, text: "Dire comme disait Napoléon dans une présentation", points: 20, emoji: "👑" },
    { id: 407, text: "Prendre des notes en dessinant uniquement des émoticônes", points: 15, emoji: "📓" },
    { id: 408, text: "Proposer de faire un point sur le point qu'on vient de faire", points: 20, emoji: "📊" },
    { id: 409, text: "Remplacer tous tes oui par absolument pendant 1h", points: 15, emoji: "✅" },
    { id: 410, text: "Citer un film comme référence professionnelle en réunion", points: 20, emoji: "🎬" },
  ],
  soiree: [
    { id: 501, text: "Offrir un verre à un inconnu et expliquer pourquoi", points: 20, emoji: "🍹" },
    { id: 502, text: "Aller voir le DJ et lui demander de passer du jazz", points: 25, emoji: "🎷" },
    { id: 503, text: "Inventer un cocktail et convaincre le barman de le faire", points: 30, emoji: "🍸" },
    { id: 504, text: "Danser avec quelqu'un que tu ne connais pas", points: 25, emoji: "💃" },
    { id: 505, text: "Faire un karaoké au bar", points: 30, emoji: "🎤" },
    { id: 506, text: "Créer un toast et le prononcer à voix haute", points: 25, emoji: "🥂" },
    { id: 507, text: "Apprendre le prénom de 5 inconnus en moins de 10 minutes", points: 25, emoji: "👥" },
    { id: 508, text: "Commander pour tout le groupe sans demander ce qu'ils veulent", points: 30, emoji: "🍽️" },
    { id: 509, text: "Faire une haie d'honneur pour quelqu'un qui sort des toilettes", points: 35, emoji: "🚽" },
    { id: 510, text: "Convaincre 3 inconnus de faire une photo avec une pose ridicule", points: 30, emoji: "🤪" },
  ],
};

const CATEGORIES = [
  { key: 'chill',  label: '🧊 Chill',  desc: 'Tranquille, entre potes' },
  { key: 'normal', label: '🎯 Normal', desc: 'Un peu de folie' },
  { key: 'chaud',  label: '🔥 Chaud',  desc: 'Pour les courageux' },
  { key: 'bureau', label: '💼 Bureau', desc: 'Au boulot, en réunion' },
  { key: 'soiree', label: '🍻 Soirée', desc: 'Afterwork, fêtes' },
];

const PURPLE = '#6c3ef5';

export default function App() {
  const [screen, setScreen]           = useState('welcome');
  const [pseudo, setPseudo]           = useState('');
  const [groupCode, setGroupCode]     = useState('');
  const [groupId, setGroupId]         = useState('');
  const [group, setGroup]             = useState<any>(null);
  const [loading, setLoading]         = useState(false);
  const [groupName, setGroupName]     = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [loserDefi, setLoserDefi]     = useState('');
  const [showCode, setShowCode]       = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddDefi, setShowAddDefi] = useState(false);
  const [mesGroupes, setMesGroupes] = useState<{code: string, name: string}[]>([]);
  const [newDefiText, setNewDefiText] = useState('');
  const [newDefiPts, setNewDefiPts]   = useState('10');

  const me         = group?.members?.find((m: any) => m.pseudo === pseudo);
  const myPoints   = me?.points || 0;
  const myDone     = me?.done   || [];
  const challenges = group?.challenges || [];

  useEffect(() => {
    if (!groupId || !db) return;
    const unsub = onSnapshot(doc(db, 'groups', groupId), snap => {
      if (snap.exists()) setGroup(snap.data());
    }, (err) => console.error("Erreur Firestore sécurisée:", err));
    return unsub;
  }, [groupId]);

useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('mesGroupes');
      if (saved) setMesGroupes(JSON.parse(saved));
    }
  }, []);

async function createGroup() {
    if (!groupName.trim()) {
      afficherErreur('Donne un nom à ton groupe !');
      return;
    }
    if (!selectedCat) {
      afficherErreur('Choisis une catégorie de défis !');
      return;
    }
    if (!loserDefi.trim()) {
      afficherErreur('Indique le défi du perdant !');
      return;
    }
    setLoading(true);
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const ref = await addDoc(collection(db, 'groups'), {
      code, name: groupName, admin: pseudo, started: false,
      category: selectedCat, loserDefi,
      challenges: DEFIS[selectedCat],
      members: [{ pseudo, points: 0, done: [] }],
      proofs: [],
    });
    setGroupId(ref.id);
    sauvegarderGroupe(code, groupName);
    setScreen('lobby');
    setLoading(false);
  }

async function joinGroup(codeDirect?: string) {
    const codeAUtiliser = codeDirect || groupCode;
    if (!pseudo.trim() || !codeAUtiliser.trim()) {
      afficherErreur('Remplis ton prénom et le code du groupe !');
      return;
    }
    setLoading(true);
    const { getDocs, query, where } = await import('firebase/firestore');
    const q = query(collection(db, 'groups'), where('code', '==', codeAUtiliser.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) {
      setLoading(false);
      afficherErreur('Groupe introuvable, vérifie le code !');
      return;
    }
    const groupDoc = snap.docs[0];
    const groupData = groupDoc.data();
    const dejaMembre = (groupData.members || []).some((m: any) => m.pseudo === pseudo);
    if (!dejaMembre) {
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        members: arrayUnion({ pseudo, points: 0, done: [] }),
      });
    }
    setGroupId(groupDoc.id);
    sauvegarderGroupe(groupData.code, groupData.name);
    setScreen('lobby');
    setLoading(false);
  }

  async function startGame() {
    await updateDoc(doc(db, 'groups', groupId), { started: true });
    setScreen('game');
  }

function sauvegarderGroupe(code: string, name: string) {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('mesGroupes');
    let liste: {code: string, name: string}[] = saved ? JSON.parse(saved) : [];
    liste = liste.filter(g => g.code !== code);
    liste.unshift({ code, name });
    liste = liste.slice(0, 5);
    window.localStorage.setItem('mesGroupes', JSON.stringify(liste));
    setMesGroupes(liste);
  }

  function supprimerGroupe(code: string) {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('mesGroupes');
    let liste: {code: string, name: string}[] = saved ? JSON.parse(saved) : [];
    liste = liste.filter(g => g.code !== code);
    window.localStorage.setItem('mesGroupes', JSON.stringify(liste));
    setMesGroupes(liste);
  }

function changerDeGroupe() {
    setShowQuitConfirm(true);
  }

  function afficherErreur(msg: string) {
    setErrorMsg(msg);
  }

  function confirmerChangerDeGroupe() {
    setShowQuitConfirm(false);
    setGroupId('');
    setGroup(null);
    setGroupCode('');
    setGroupName('');
    setSelectedCat('');
    setLoserDefi('');
    setScreen('welcome');
  }

  async function ajouterDefiCustom() {
    if (!newDefiText.trim()) return Alert.alert('Décris le défi !');
    if (loading) return;
    try {
      setLoading(true);
      const newDefi = {
        id: Date.now(),
        text: newDefiText.trim(),
        points: parseInt(newDefiPts) || 10,
        emoji: '⚡',
        custom: true,
      };
      await updateDoc(doc(db, 'groups', groupId), {
        challenges: arrayUnion(newDefi),
      });
      setNewDefiText('');
      setNewDefiPts('10');
      setShowAddDefi(false);
      setLoading(false);
      if (typeof window !== 'undefined') window.alert('Défi ajouté !');
      else Alert.alert('Défi ajouté !');
    } catch (err) {
      setLoading(false);
    }
  }

  async function posterDefi(challenge: any) {
    if (typeof document !== 'undefined') {
      ouvrirPellicule(challenge);
      return;
    }
    Alert.alert('🎯 Réaliser ce défi', challenge.text, [
      { text: 'Annuler', style: 'cancel' },
      { text: '📷 Caméra', onPress: () => ouvrirCamera(challenge) },
      { text: '🖼️ Pellicule', onPress: () => ouvrirPellicule(challenge) },
    ]);
  }

  async function ouvrirCamera(challenge: any) {
    const ImagePicker = await import('expo-image-picker');
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission refusée');
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) await envoyerPreuve(challenge, result.assets[0].uri, result.assets[0].type || 'image');
  }

  async function ouvrirPellicule(challenge: any) {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const type = file.type.startsWith('video') ? 'video' : 'image';
        await envoyerPreuve(challenge, '', type, file);
      };
      input.click();
      return;
    }
    const ImagePicker = await import('expo-image-picker');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission refusée');
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) await envoyerPreuve(challenge, result.assets[0].uri, result.assets[0].type || 'image');
  }

  async function envoyerPreuve(challenge: any, uri: string, type: string, file?: File) {
    try {
      const formData = new FormData();
      formData.append('upload_preset', 'traquenard');
      if (file) formData.append('file', file);
      else formData.append('file', { uri, type: type === 'video' ? 'video/mp4' : 'image/jpeg', name: type === 'video' ? 'proof.mp4' : 'proof.jpg' } as any);
      
      const resourceType = type === 'video' ? 'video' : 'image';
      const response = await fetch(`https://api.cloudinary.com/v1_1/dp64sdpit/${resourceType}/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      const url = data.secure_url;
      
      const newProof = { id: Date.now().toString(), pseudo, challenge, mediaUri: url, mediaType: type, votes: [], timestamp: Date.now() };
      const updatedMembers = group.members.map((m: any) => m.pseudo === pseudo ? { ...m, done: [...m.done, challenge.id] } : m);
      
      await updateDoc(doc(db, 'groups', groupId), { proofs: arrayUnion(newProof), members: updatedMembers });
      
      if (typeof window !== 'undefined') window.alert('📸 Preuve postée !');
      else Alert.alert('📸 Posté !', 'Tes potes peuvent voter !');
    } catch (error) {
      Alert.alert('❌ Échec de l\'envoi');
    }
  }

  async function voter(proof: any, validated: boolean) {
    const updatedProofs = group.proofs.map((p: any) => {
      if (p.id !== proof.id) return p;
      const newVotes = [...(p.votes || []), { pseudo, validated }];
      const total = newVotes.length;
      const pour  = newVotes.filter((v: any) => v.validated).length;
      const needed = Math.ceil((group.members.length - 1) / 2);
      
      if (total >= needed && pour > total / 2) {
        const updatedMembers = group.members.map((m: any) => m.pseudo === proof.pseudo ? { ...m, points: m.points + proof.challenge.points } : m);
        updateDoc(doc(db, 'groups', groupId), { members: updatedMembers });
      }
      return { ...p, votes: newVotes };
    });
    
    await updateDoc(doc(db, 'groups', groupId), { proofs: updatedProofs });
    Alert.alert(validated ? '✅ Validé !' : '❌ Refusé !');
  }

  // ── ÉCRANS DE DÉMARRAGE ───────────────────────────────────────────────────
  if (screen === 'welcome') return (
    <ScrollView contentContainerStyle={s.center}>
      <Text style={s.bigLogo}>Traquenard</Text>
      <Text style={s.tagline}>Défis entre potes 🔥</Text>
      <TextInput style={s.input} placeholder="Ton prénom" value={pseudo} onChangeText={setPseudo} />
      
  <TouchableOpacity style={s.btn} onPress={() => {
        if (!pseudo.trim()) {
          afficherErreur('Entre ton prénom !');
          return;
        }
        setScreen('create');
      }}>
        <Text style={s.btnTxt}>Créer un groupe →</Text>
      </TouchableOpacity>
      
      <Text style={s.orTxt}>— ou rejoindre —</Text>
      <TextInput style={s.input} placeholder="Code du groupe" value={groupCode} onChangeText={setGroupCode} autoCapitalize="characters" />
      
      <TouchableOpacity style={[s.btn, { backgroundColor: '#ede9fe' }]} onPress={() => joinGroup()} disabled={loading}>
        {loading ? <ActivityIndicator color={PURPLE} /> : <Text style={[s.btnTxt, { color: PURPLE }]}>Rejoindre</Text>}
      </TouchableOpacity>

      {mesGroupes.length > 0 ? (
        <View style={{ width: '100%', marginTop: 20 }}>
          <Text style={s.orTxt}>— mes groupes —</Text>
          {mesGroupes.map(g => (
            <View key={g.code} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <TouchableOpacity
                style={[s.btn, { backgroundColor: '#fff', borderWidth: 2, borderColor: PURPLE, flex: 1, marginBottom: 0 }]}
                onPress={() => joinGroup(g.code)}
                disabled={loading}
              >
                <Text style={[s.btnTxt, { color: PURPLE }]}>↩️ {g.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#fee2e2', borderRadius: 20, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => supprimerGroupe(g.code)}
              >
                <Text style={{ color: '#dc2626', fontWeight: '900', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}
      <Modal visible={!!errorMsg} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>⚠️ Oups</Text>
            <Text style={{ textAlign: 'center', color: '#555', marginBottom: 16 }}>{errorMsg}</Text>
            <TouchableOpacity style={s.btn} onPress={() => setErrorMsg('')}><Text style={s.btnTxt}>OK</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  if (screen === 'create') return (
    <ScrollView contentContainerStyle={s.formScreen}>
      <TouchableOpacity onPress={() => setScreen('welcome')}><Text style={s.back}>← Retour</Text></TouchableOpacity>
      <Text style={s.formTitle}>Créer un groupe</Text>
      
      <Text style={s.label}>Nom du groupe</Text>
      <TextInput style={s.input} placeholder="Ex : Bande de l'été 🌞" value={groupName} onChangeText={setGroupName} />
      
      <Text style={s.label}>Catégorie de défis</Text>
      {CATEGORIES.map(cat => (
        <TouchableOpacity key={cat.key} style={[s.catCard, selectedCat === cat.key && s.catSelected]} onPress={() => setSelectedCat(cat.key)}>
          <Text style={s.catLabel}>{cat.label}</Text>
          <Text style={s.catDesc}>{cat.desc}</Text>
        </TouchableOpacity>
      ))}
      
      <Text style={s.label}>Défi du perdant 🍽️</Text>
      <TextInput style={s.input} placeholder="Ex : payer le restau, se raser la tête..." value={loserDefi} onChangeText={setLoserDefi} />
      
      <TouchableOpacity style={[s.btn, { marginTop: 8 }]} onPress={createGroup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Créer et inviter mes potes 🚀</Text>}
      </TouchableOpacity>

      <Modal visible={!!errorMsg} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>⚠️ Oups</Text>
            <Text style={{ textAlign: 'center', color: '#555', marginBottom: 16 }}>{errorMsg}</Text>
            <TouchableOpacity style={s.btn} onPress={() => setErrorMsg('')}><Text style={s.btnTxt}>OK</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  if (screen === 'lobby') return (
    <ScrollView contentContainerStyle={s.formScreen}>
      <Text style={s.bigLogo}>Traquenard</Text>
      <Text style={s.groupName}>{group?.name}</Text>
      
      <View style={s.codeBox}>
        <Text style={s.codeLabel}>Code d'invitation</Text>
        <Text style={s.codeValue}>{group?.code}</Text>
        <Text style={s.codeSub}>Partage ce code à tes potes !</Text>
      </View>
      
      <View style={s.infoRow}>
        <Text style={s.infoTag}>{CATEGORIES.find(c => c.key === group?.category)?.label}</Text>
        <Text style={s.infoTag}>🍽️ {group?.loserDefi}</Text>
      </View>
      
      <Text style={s.sectionTitle}>Membres ({group?.members?.length})</Text>
      {group?.members?.map((m: any) => (
        <View key={m.pseudo} style={s.memberRow}>
          <Text style={s.memberName}>🧑 {m.pseudo}</Text>
          {m.pseudo === group.admin && <Text style={s.adminTag}>👑 Admin</Text>}
        </View>
      ))}
      
      <TouchableOpacity style={[s.btn, { backgroundColor: '#ede9fe', marginTop: 16 }]} onPress={() => setShowAddDefi(true)}>
        <Text style={[s.btnTxt, { color: PURPLE }]}>➕ Ajouter un défi custom</Text>
      </TouchableOpacity>
      
      {pseudo === group?.admin && !group?.started && (
        <TouchableOpacity style={[s.btn, { marginTop: 12 }]} onPress={startGame}>
          <Text style={s.btnTxt}>Lancer la partie 🔥</Text>
        </TouchableOpacity>
      )}
      
      {group?.started && (
        <TouchableOpacity style={[s.btn, { marginTop: 12 }]} onPress={() => setScreen('game')}>
          <Text style={s.btnTxt}>Entrer dans le jeu →</Text>
        </TouchableOpacity>
      )}
      
      {!group?.started && pseudo !== group?.admin && <Text style={s.waiting}>En attente que l'admin lance la partie...</Text>}
      
      <Modal visible={showAddDefi} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>➕ Nouveau défi</Text>
            <TextInput style={s.input} placeholder="Décris le défi..." value={newDefiText} onChangeText={setNewDefiText} multiline />
            <TextInput style={s.input} placeholder="Points (ex: 20)" value={newDefiPts} onChangeText={setNewDefiPts} keyboardType="numeric" />
            <TouchableOpacity style={s.btn} onPress={ajouterDefiCustom}><Text style={s.btnTxt}>Ajouter ✅</Text></TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: '#fee2e2', marginTop: 4 }]} onPress={() => setShowAddDefi(false)}><Text style={[s.btnTxt, { color: '#dc2626' }]}>Annuler</Text></TouchableOpacity>          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  // ── INTERFACE PRINCIPALE DE NAVIGATION PARTAGÉE ───────────────────────────
  const pending = (group?.proofs || []).filter((p: any) =>
    p.pseudo !== pseudo && !(p.votes || []).find((v: any) => v.pseudo === pseudo)
  );
  const pendingCount = pending.length;
  const sortedMembers = [...(group?.members || [])].sort((a: any, b: any) => b.points - a.points);
  const loser = sortedMembers[sortedMembers.length - 1];

  return (
    <View style={s.root}>
      {/* HEADER COMPLET */}
<View style={s.header}>
        <Text style={s.logo}>Traquenard</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.switchBtn} onPress={changerDeGroupe}>
            <Text style={s.switchBtnTxt}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.codeBtn} onPress={() => setShowCode(true)}>
            <Text style={s.codeBtnTxt}>🔗 {group?.code}</Text>
          </TouchableOpacity>
          <Text style={s.pts}>{myPoints} pts</Text>
        </View>
      </View>

      {/* ZONE CENTRALE CHANGEMENT D'ONGLET */}
      <ScrollView style={s.content}>
        
        {/* ONGLET 1 : LES DÉFIS */}
        {screen === 'game' && (
          <View style={{ paddingBottom: 40 }}>
            {pendingCount > 0 && (              <TouchableOpacity style={s.storiesBar} onPress={() => setScreen('stories')}>
                <Text style={s.storiesBarTxt}>🗳️ {pendingCount} preuve{pendingCount > 1 ? 's' : ''} à juger — Voter</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={s.addDefiBtn} onPress={() => setShowAddDefi(true)}>
              <Text style={s.addDefiBtnTxt}>➕ Ajouter un défi custom</Text>
            </TouchableOpacity>
            
            <Text style={s.sectionTitle}>Tes défis {CATEGORIES.find(c => c.key === group?.category)?.label}</Text>
            {challenges.map((c: any) => (
              <View key={c.id} style={[s.card, myDone.includes(c.id) && s.cardDone]}>
                <View style={s.cardTop}>
                  <Text style={s.emoji}>{c.emoji}</Text>
                  {c.custom && <Text style={s.customTag}>⚡ Custom</Text>}
                  <Text style={s.cardPts}>+{c.points} pts</Text>
                </View>
                <Text style={s.cardText}>{c.text}</Text>
                {myDone.includes(c.id)
                  ? <Text style={s.validated}>✅ Preuve postée !</Text>
                  : <TouchableOpacity style={s.doBtn} onPress={() => posterDefi(c)}><Text style={s.doBtnTxt}>🎯 Réaliser ce défi</Text></TouchableOpacity>
                }
              </View>
            ))}
          </View>
        )}

        {/* ONGLET 2 : VOTES (STORIES) */}
        {screen === 'stories' && (
          <View style={{ paddingBottom: 40 }}>
            <Text style={s.sectionTitle}>Votes en cours 🗳️</Text>
            {pendingCount === 0 && <View style={s.emptyBox}><Text style={s.emptyIcon}>🎉</Text><Text style={s.emptyTxt}>Aucune preuve à voter !</Text></View>}
            
            {pending.map((proof: any) => (
              <View key={proof.id} style={s.proofCard}>
                {proof.mediaUri && proof.mediaType === 'video' ? (
                  <video src={proof.mediaUri} style={s.webVideo} controls playsInline />
                ) : (
                  proof.mediaUri && <Image source={{ uri: proof.mediaUri }} style={s.proofImg} />
                )}
                
                <Text style={s.proofEmoji}>{proof.challenge.emoji}</Text>
                <Text style={s.proofName}><Text style={{ color: PURPLE, fontWeight: '900' }}>{proof.pseudo}</Text> doit :</Text>
                <Text style={s.proofText}>"{proof.challenge.text}"</Text>
                <Text style={s.proofPts}>+{proof.challenge.points} pts en jeu</Text>
                <Text style={s.proofVotes}>{(proof.votes || []).length} vote(s) sur {group.members.length - 1}</Text>
                
                <View style={s.voteRow}>
                  <TouchableOpacity style={s.voteNo}  onPress={() => voter(proof, false)}><Text style={s.voteTxt}>❌ Refuser</Text></TouchableOpacity>
                  <TouchableOpacity style={s.voteYes} onPress={() => voter(proof, true)}><Text style={s.voteTxt}>✅ Valider</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ONGLET 3 : CLASSEMENT */}
        {screen === 'board' && (
          <View style={{ paddingBottom: 40 }}>
            <Text style={s.sectionTitle}>Classement 🏆</Text>
            {sortedMembers.map((m: any, i: number) => (
              <View key={m.pseudo} style={[s.rankRow, m.pseudo === pseudo && s.rankMe]}>
                <Text style={s.rankPos}>{['🥇','🥈','🥉'][i] || `#${i+1}`}</Text>
                <Text style={s.rankName}>{m.pseudo}{m.pseudo === pseudo ? ' (toi)' : ''}</Text>
                <Text style={s.rankPts}>{m.points} pts</Text>
              </View>
            ))}
            {loser && <View style={s.loserBox}><Text style={s.loserTxt}>😬 <Text style={{ fontWeight: '900' }}>{loser.pseudo}</Text> devra : {group?.loserDefi}</Text></View>}
          </View>
        )}
      </ScrollView>

      {/* MENU BAS (FIXE ET NAVIGABLE) */}
      <View style={s.nav}>
        <TouchableOpacity style={[s.navBtn, screen === 'game' && s.navBtnActive]} onPress={() => setScreen('game')}><Text style={s.navIcon}>🎯</Text><Text style={s.navLbl}>Défis</Text></TouchableOpacity>
        <TouchableOpacity style={[s.navBtn, screen === 'stories' && s.navBtnActive]} onPress={() => setScreen('stories')}><Text style={s.navIcon}>🗳️</Text><Text style={s.navLbl}>Votes{pendingCount > 0 ? ` (${pendingCount})` : ''}</Text></TouchableOpacity>
        <TouchableOpacity style={[s.navBtn, screen === 'board' && s.navBtnActive]} onPress={() => setScreen('board')}><Text style={s.navIcon}>🏆</Text><Text style={s.navLbl}>Classement</Text></TouchableOpacity>
      </View>

      {/* POPUPS SÉCURISÉES */}
      <Modal visible={showCode} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Inviter des potes 🔗</Text>
            <Text style={s.codeValue}>{group?.code}</Text>
            <Text style={s.codeSub}>Partage ce code pour rejoindre la partie !</Text>
            <TouchableOpacity style={[s.btn, { marginTop: 16 }]} onPress={() => setShowCode(false)}><Text style={s.btnTxt}>Fermer</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showQuitConfirm} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Changer de groupe ?</Text>
            <Text style={{ textAlign: 'center', color: '#555', marginBottom: 16 }}>Tu vas quitter ce groupe et retourner à l'accueil. Tu pourras le rejoindre à nouveau plus tard.</Text>
            <TouchableOpacity style={s.btn} onPress={confirmerChangerDeGroupe}><Text style={s.btnTxt}>Confirmer</Text></TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: '#fee2e2', marginTop: 4 }]} onPress={() => setShowQuitConfirm(false)}><Text style={[s.btnTxt, { color: '#dc2626' }]}>Annuler</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddDefi} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>➕ Nouveau défi</Text>
            <TextInput style={s.input} placeholder="Décris le défi..." value={newDefiText} onChangeText={setNewDefiText} multiline />
            <TextInput style={s.input} placeholder="Points (ex: 20)" value={newDefiPts} onChangeText={setNewDefiPts} keyboardType="numeric" />
            <TouchableOpacity style={s.btn} onPress={ajouterDefiCustom}><Text style={s.btnTxt}>Ajouter ✅</Text></TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: '#fee2e2', marginTop: 4 }]} onPress={() => setShowAddDefi(false)}><Text style={[s.btnTxt, { color: '#dc2626' }]}>Annuler</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#f5f3ff' },
  center:       { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f5f3ff' },
  formScreen:   { flexGrow: 1, padding: 24, paddingTop: 60, backgroundColor: '#f5f3ff' },
  bigLogo:      { fontSize: 40, fontWeight: '900', color: PURPLE, marginBottom: 4 },
  tagline:      { fontSize: 15, color: '#666', marginBottom: 28 },
  orTxt:        { color: '#aaa', fontWeight: '700', marginVertical: 12 },
  input:        { width: '100%', backgroundColor: '#fff', borderRadius: 14, padding: 14, fontSize: 16, marginBottom: 12, borderWidth: 2, borderColor: '#ede9fe' },
  btn:          { backgroundColor: PURPLE, borderRadius: 24, padding: 14, alignItems: 'center', width: '100%', marginBottom: 8 },
  btnTxt:       { color: '#fff', fontWeight: '800', fontSize: 16 },
  back:         { color: PURPLE, fontWeight: '700', fontSize: 16, marginBottom: 20 },
  formTitle:    { fontSize: 26, fontWeight: '900', color: '#1a1a2e', marginBottom: 20 },
  label:        { fontSize: 13, fontWeight: '800', color: '#555', marginBottom: 8, marginTop: 4 },
  catCard:      { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 2, borderColor: '#ede9fe' },
  catSelected:  { borderColor: PURPLE, backgroundColor: '#f3f0ff' },
  catLabel:     { fontSize: 16, fontWeight: '800', color: '#1a1a2e' },
  catDesc:      { fontSize: 12, color: '#888', marginTop: 2 },
  groupName:    { fontSize: 18, fontWeight: '700', color: '#555', marginBottom: 16 },
  codeBox:      { backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 16 },
  codeLabel:    { fontSize: 12, color: '#888', fontWeight: '700' },
  codeValue:    { fontSize: 36, fontWeight: '900', color: PURPLE, letterSpacing: 6, marginVertical: 4, textAlign: 'center' },
  codeSub:      { fontSize: 12, color: '#aaa', textAlign: 'center' },
  infoRow:      { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  infoTag:      { backgroundColor: '#ede9fe', borderRadius: 10, padding: 8, fontSize: 13, fontWeight: '700', color: PURPLE },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#2d1b69', marginBottom: 12 },
  memberRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  memberName:   { flex: 1, fontWeight: '700', fontSize: 15 },
  adminTag:     { fontSize: 12, color: '#92400e', backgroundColor: '#fef3c7', padding: 4, borderRadius: 8 },
  waiting:      { textAlign: 'center', color: '#888', marginTop: 20, fontStyle: 'italic' },
  header:       { backgroundColor: PURPLE, padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo:         { color: '#fff', fontSize: 20, fontWeight: '900' },
  pts:          { backgroundColor: '#fff', color: PURPLE, fontWeight: '800', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, fontSize: 13 },
  codeBtn:      { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  switchBtn:    { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  switchBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  codeBtnTxt:   { color: '#fff', fontWeight: '700', fontSize: 13 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  content:      { padding: 16, flex: 1 },
  storiesBar:   { backgroundColor: PURPLE, borderRadius: 14, padding: 14, marginBottom: 12, alignItems: 'center' },
  storiesBarTxt:{ color: '#fff', fontWeight: '800', fontSize: 14 },
  addDefiBtn:   { backgroundColor: '#ede9fe', borderRadius: 14, padding: 12, marginBottom: 12, alignItems: 'center' },
  addDefiBtnTxt:{ color: PURPLE, fontWeight: '800', fontSize: 14 },
  card:         { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardDone:     { opacity: 0.55 },
  cardTop:      { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  emoji:        { fontSize: 24 },
  customTag:    { fontSize: 11, fontWeight: '800', color: '#7c3aed', backgroundColor: '#ede9fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  cardPts:      { marginLeft: 'auto', fontWeight: '800', color: PURPLE },
  cardText:     { fontSize: 14, fontWeight: '600', color: '#1a1a2e', marginBottom: 12, lineHeight: 20 },
  doBtn:        { backgroundColor: PURPLE, borderRadius: 20, padding: 10, alignItems: 'center' },
  doBtnTxt:     { color: '#fff', fontWeight: '700' },
  validated:    { color: '#16a34a', fontWeight: '800' },
  nav:          { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ede9fe', paddingVertical: 8, justifyContent: 'space-around' },
  navBtn:       { alignItems: 'center', padding: 8, flex: 1, opacity: 0.4 },
  navBtnActive: { opacity: 1 },
  navIcon:      { fontSize: 22 },
  navLbl:       { fontSize: 11, fontWeight: '700', color: PURPLE, marginTop: 2 },
  proofCard:    { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
proofImg:     { width: '100%', height: 300, borderRadius: 12, marginBottom: 12, resizeMode: 'contain', backgroundColor: '#000' },
  webVideo:     { width: '100%', maxHeight: 300, borderRadius: 12, marginBottom: 12, backgroundColor: '#000' },
  proofEmoji:   { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  proofName:    { fontWeight: '600', fontSize: 15, color: '#1a1a2e' },
  proofText:    { fontSize: 16, fontStyle: 'italic', color: '#2d1b69', fontWeight: '800', marginVertical: 6, lineHeight: 22 },
  proofPts:     { fontWeight: '800', color: PURPLE, marginBottom: 4 },
  proofVotes:   { fontSize: 12, color: '#aaa', marginBottom: 12 },
  voteRow:      { flexDirection: 'row', gap: 8 },
  voteNo:       { flex: 1, backgroundColor: '#fee2e2', borderRadius: 12, padding: 12, alignItems: 'center' },
  voteYes:      { flex: 1, backgroundColor: '#dcfce7', borderRadius: 12, padding: 12, alignItems: 'center' },
  voteTxt:      { fontWeight: '800', fontSize: 14 },
  emptyBox:     { alignItems: 'center', paddingTop: 60 },
  emptyIcon:    { fontSize: 52, marginBottom: 12 },
  emptyTxt:     { fontSize: 16, color: '#888', fontWeight: '700' },
  rankRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  rankMe:       { borderWidth: 2, borderColor: PURPLE, backgroundColor: '#f3f0ff' },
  rankPos:      { fontSize: 22, marginRight: 12 },
  rankName:     { flex: 1, fontWeight: '800', fontSize: 15 },
  rankPts:      { fontWeight: '900', fontSize: 18, color: PURPLE },
  loserBox:     { marginTop: 16, backgroundColor: '#fff3cd', borderRadius: 14, padding: 16 },
  loserTxt:     { fontSize: 15, color: '#856404', lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox:     { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%' },
  modalTitle:   { fontSize: 20, fontWeight: '900', color: '#1a1a2e', marginBottom: 16, textAlign: 'center' },
});