import AsyncStorage from '@react-native-async-storage/async-storage';
import { Memory, Message } from '../types/types';

export const saveMemory = async (memory: Memory) => {
  try {
    const memories = await getMemories();
    memories.push(memory);
    await AsyncStorage.setItem('memories', JSON.stringify(memories));
  } catch (error) {
    console.error('Error saving memory:', error);
  }
};

export const getMemories = async (): Promise<Memory[]> => {
  try {
    const memories = await AsyncStorage.getItem('memories');
    return memories ? JSON.parse(memories) : [];
  } catch (error) {
    console.error('Error getting memories:', error);
    return [];
  }
};

export const saveMessages = async (messages: Message[]) => {
  try {
    await AsyncStorage.setItem('chat_history', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages:', error);
  }
};

export const getMessages = async (): Promise<Message[]> => {
  try {
    const messages = await AsyncStorage.getItem('chat_history');
    return messages ? JSON.parse(messages) : [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};