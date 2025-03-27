import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types/types';

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isAI = message.sender === 'ai';

  return (
    <View style={[
      styles.container,
      isAI ? styles.aiContainer : styles.userContainer
    ]}>
      <Text style={[
        styles.text,
        isAI ? styles.aiText : styles.userText
      ]}>
        {message.content}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
    marginVertical: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aiContainer: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#E3E3E3',
  },
  userContainer: {
    backgroundColor: '#6C5CE7',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiText: {
    color: '#2D3436',
  },
  userText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#A0A0A0',
    alignSelf: 'flex-end',
    marginTop: 6,
    fontStyle: 'italic',
  },
});