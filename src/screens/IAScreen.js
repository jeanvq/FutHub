import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

const QUICK_CHIPS = [
  { key: 'predictions', icon: 'stats-chart', label: 'Predicciones', lib: 'Ionicons' },
  { key: 'curious', icon: 'bulb-outline', label: 'Datos curiosos', lib: 'Ionicons' },
  { key: 'analysis', icon: 'flash-outline', label: 'Análisis', lib: 'Ionicons' },
];

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
      paddingHorizontal: 16,
    }}>
      {!isUser && (
        <View style={{
          width: 32, height: 32, borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: 0.5, borderColor: colors.gradientStart + '40',
          alignItems: 'center', justifyContent: 'center',
          marginRight: 8, alignSelf: 'flex-end',
        }}>
          <MaterialCommunityIcons name="robot-outline" size={18} color={colors.gradientStart} />
        </View>
      )}
      <View style={{
        maxWidth: '75%', borderRadius: 18,
        borderBottomRightRadius: isUser ? 4 : 18,
        borderBottomLeftRadius: isUser ? 18 : 4,
        overflow: 'hidden',
      }}>
        {isUser ? (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ paddingHorizontal: 14, paddingVertical: 10 }}
          >
            <Text style={{ color: colors.background, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
              {message.content}
            </Text>
            <Text style={{ color: 'rgba(0,0,0,0.4)', fontFamily: fonts.regular, fontSize: 10, marginTop: 4, textAlign: 'right' }}>
              {message.time}
            </Text>
          </LinearGradient>
        ) : (
          <View style={{
            backgroundColor: colors.card,
            borderWidth: 0.5, borderColor: colors.cardBorder,
            paddingHorizontal: 14, paddingVertical: 10,
          }}>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
              {message.content}
            </Text>
            <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 10, marginTop: 4 }}>
              {message.time}
            </Text>
          </View>
        )}
      </View>
      {isUser && (
        <View style={{
          width: 32, height: 32, borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: 0.5, borderColor: colors.cardBorder,
          alignItems: 'center', justifyContent: 'center',
          marginLeft: 8, alignSelf: 'flex-end',
        }}>
          <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
        </View>
      )}
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, alignItems: 'center', gap: 8 }}>
      <View style={{
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 0.5, borderColor: colors.gradientStart + '40',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <MaterialCommunityIcons name="robot-outline" size={18} color={colors.gradientStart} />
      </View>
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 0.5, borderColor: colors.cardBorder,
        paddingHorizontal: 14, paddingVertical: 12,
        borderRadius: 18, borderBottomLeftRadius: 4,
      }}>
        <ActivityIndicator size="small" color={colors.live} />
      </View>
    </View>
  );
}

function getTime() {
  return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function IAScreen() {
  const { t } = useTranslation();
  const flatListRef = useRef(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: t('ia_welcome'),
      time: getTime(),
    }
  ]);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      time: getTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const systemPrompt = `Eres FutIA, el asistente de inteligencia artificial de FutHub.
      Eres experto en fútbol mundial — Champions League, Premier League, La Liga, Bundesliga, Serie A, Copa Libertadores, Copa Sudamericana y Liga BetPlay de Colombia.
      Respondes en el mismo idioma que el usuario. Tus respuestas son concisas, precisas y apasionadas por el fútbol.
      Cuando das predicciones, explicas brevemente el razonamiento basado en forma reciente y estadísticas.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 500,
          system: systemPrompt,
          messages: [
            ...messages.filter(m => m.id !== '0').map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: messageText },
          ],
        }),
      });

      const data = await response.json();
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content?.[0]?.text || 'Lo siento, hubo un error. Intenta de nuevo.',
        time: getTime(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      scrollToBottom();
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
        time: getTime(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickChip = (key) => {
    const questions = {
      predictions: '¿Quién tiene más probabilidades de ganar hoy?',
      curious: 'Cuéntame un dato curioso del fútbol',
      analysis: 'Analiza el partido más importante de hoy',
    };
    sendMessage(questions[key]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialCommunityIcons name="robot" size={20} color={colors.background} />
          </LinearGradient>
          <View>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 17 }}>
              Fut<Text style={{ color: colors.gradientStart }}>IA</Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live }} />
              <Text style={{ color: colors.live, fontFamily: fonts.regular, fontSize: 11 }}>En línea</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setMessages([{ id: '0', role: 'assistant', content: t('ia_welcome'), time: getTime() }])}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13 }}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingVertical: 16 }}
        onContentSizeChange={scrollToBottom}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
      />

      {/* Quick chips */}
      {messages.length <= 1 && (
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 }}>
          {QUICK_CHIPS.map(chip => (
            <TouchableOpacity
              key={chip.key}
              onPress={() => handleQuickChip(chip.key)}
              style={{
                flex: 1, backgroundColor: colors.card,
                borderWidth: 0.5, borderColor: colors.cardBorder,
                borderRadius: 20, paddingVertical: 8, paddingHorizontal: 10,
                alignItems: 'center', flexDirection: 'row',
                justifyContent: 'center', gap: 4,
              }}
            >
              <Ionicons name={chip.icon} size={14} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 }}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingVertical: 12,
          borderTopWidth: 0.5, borderTopColor: colors.cardBorder, gap: 10,
        }}>
          <TextInput
            style={{
              flex: 1, backgroundColor: colors.card,
              borderWidth: 0.5, borderColor: colors.cardBorder,
              borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
              color: colors.textPrimary, fontFamily: fonts.regular,
              fontSize: 14, maxHeight: 100,
            }}
            placeholder={t('ia_placeholder')}
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity onPress={() => sendMessage()} disabled={!input.trim() || isLoading}>
            <LinearGradient
              colors={input.trim() && !isLoading
                ? [colors.gradientStart, colors.gradientMid]
                : [colors.card, colors.card]
              }
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{
                width: 44, height: 44, borderRadius: 22,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 0.5,
                borderColor: input.trim() && !isLoading ? colors.gradientStart : colors.cardBorder,
              }}
            >
              <Ionicons
                name="send"
                size={18}
                color={input.trim() && !isLoading ? colors.background : colors.textTertiary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
