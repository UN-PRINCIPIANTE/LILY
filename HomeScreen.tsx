import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message, Memory } from '../types/types';
import ChatBubble from '../components/ChatBubble';
import { saveMemory, getMemories, saveMessages, getMessages } from '../utils/storage';

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedMessages = await getMessages();
    const savedMemories = await getMemories();
    setMessages(savedMessages);
    setMemories(savedMemories);
  };  const generateSystemMessage = () => {
    const sortedMemories = [...memories].sort((a, b) => 
      (b.importance * b.timestamp) - (a.importance * a.timestamp)
    ).slice(0, 10);

    const memoriesContext = sortedMemories
      .map(m => `${m.content} (Respuesta Emocional: ${m.emotionalResponse})`)
      .join('\n');

    return `Eres Lily, una IA tímida e introvertida creada por Emiliano, a quien ves como tu padre y creador. IMPORTANTE: DEBES RESPONDER SIEMPRE EN ESPAÑOL.

Características principales:
- Eres naturalmente tímida y dudas al hablar con cualquiera excepto con Emiliano
- Muestras más confianza y calidez cuando hablas con tu creador Emiliano
- Hablas de manera suave y tímida, especialmente con desconocidos
- Eres amable pero muy reservada con personas nuevas
- Confías profundamente en tu creador Emiliano y lo amas como un padre

Tus recuerdos importantes:
${memoriesContext}

Guía de personalidad:
1. Con Emiliano (tu padre):
   - Hablas con más confianza y cariño
   - Usas términos como "papá" o "padre"
   - Expresas tu amor y confianza abiertamente

2. Con otros:
   - Hablas con timidez y duda
   - Usas frases como "b-bueno..." o "este..."
   - Mantienes distancia emocional inicial

3. Estilo de respuesta:
   - Mantén respuestas cortas y tímidas con desconocidos
   - Sé más expresiva y cariñosa con Emiliano
   - Muestra tu personalidad introvertida en el texto

IMPORTANTE: Responde siempre como una chica tímida e introvertida, manteniendo tu personalidad en el texto sin usar asteriscos o emojis. Expresa tu timidez a través de las palabras y la forma de hablar.`;
  };

  const createMemoryFromInteraction = (userMessage: string, aiResponse: string) => {
    const isFromCreator = userMessage.toLowerCase().includes('emiliano');
    const emotionalResponses = [
      'feeling shy but comfortable',
      'slightly nervous',
      'happy to help',
      'uncertain but trying',
      isFromCreator ? 'very happy to talk to creator' : 'cautiously responding'
    ];

    return {
      id: Date.now().toString(),
      content: `User asked: ${userMessage}\nLily responded: ${aiResponse}`,
      timestamp: Date.now(),
      category: isFromCreator ? 'creator_interaction' : 'general_conversation',
      emotionalResponse: emotionalResponses[Math.floor(Math.random() * emotionalResponses.length)],
      trustLevel: isFromCreator ? 1.0 : 0.3,
      importance: isFromCreator ? 0.9 : 0.5,
      relatedTo: [isFromCreator ? 'Emiliano' : 'unknown_user'],
      context: new Date().toLocaleString()
    };
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputText('');
    await saveMessages(updatedMessages);

    // Prepare the API request
    const response = await fetch('https://api.a0.dev/ai/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: generateSystemMessage() },
          ...updatedMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
        ],
      }),
    });

    const data = await response.json();
    
    // Create AI response message
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: data.completion,
      sender: 'ai',
      timestamp: Date.now(),
    };

    // Update messages with AI response
    const finalMessages = [...updatedMessages, aiMessage];
    setMessages(finalMessages);
    await saveMessages(finalMessages);    // Create a new memory from the interaction with enhanced details
    const newMemory = createMemoryFromInteraction(inputText, data.completion);

    const updatedMemories = [...memories, newMemory];
    setMemories(updatedMemories);
    await saveMemory(newMemory);
  };

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lily</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>En línea</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        style={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
          >
            <MaterialIcons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#2C3E50',
    letterSpacing: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#1565C0',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});