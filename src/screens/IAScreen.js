import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme';

const QUICK_CHIPS = [
  { key: 'predictions', icon: '📊' },
  { key: 'curious', icon: '💡' },
  { key: 'analysis', icon: '⚡' },
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
          width: 32, height: 32,
          borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: 0.5,
          borderColor: colors.cardBorder,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
          alignSelf: 'flex-end',
        }}>
          <Text style={{ fontSize: 16 }}>🤖</Text>
        </View>
      )}

      <View style={{
        maxWidth: '75%',
        borderRadius: isUser ? 18 : 18,
        borderBottomRightRadius: isUser ? 4 : 18,
        borderBottomLeftRadius: isUser ? 18 : 4,
        overflow: 'hidden',
      }}>
        {isUser ? (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingHorizontal: 14, paddingVertical: 10 }}
          >
            <Text style={{ color: colors.background, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
              {message.content}
            </Text>
          </LinearGradient>
        ) : (
          <View style={{
            backgroundColor: colors.card,
            borderWidth: 0.5,
            borderColor: colors.cardBorder,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
              {message.content}
            </Text>
          </View>
        )}
      </View>

      {isUser && (
        <View style={{
          width: 32, height: 32,
          borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: 0.5,
          borderColor: colors.cardBorder,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 8,
          alignSelf: 'flex-end',
        }}>
          <Text style={{ fontSize: 16 }}>👤</Text>
        </View>
      )}
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={{
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 12,
      alignItems: 'center',
      gap: 8,
    }}>
      <View style={{
        width: 32, height: 32,
        borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 16 }}>🤖</Text>
      </View>
      <View style={{
        backgroundColor: colors.card,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
      }}>
        <ActivityIndicator size="small" color={colors.live} />
      </View>
    </View>
  );
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
    }
  ]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    try {
      // Contexto del sistema para el asistente
      const systemPrompt = `Eres el asistente de IA de FutHub, una app de fútbol. 
      Respondes preguntas sobre partidos, estadísticas, equipos, jugadores y predicciones de fútbol.
      Eres experto en fútbol mundial, especialmente en Champions League, Premier League, La Liga, Bundesliga, Serie A y Liga BetPlay de Colombia.
      Tus respuestas son concisas, informativas y en el mismo idioma que el usuario.
      Cuando das predicciones, explicas brevemente el razonamiento basado en estadísticas y forma reciente.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'TU_API_KEY_AQUI',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 500,
          system: systemPrompt,
          messages: [
            ...messages.filter(m => m.id !== '0').map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: messageText },
          ],
        }),
      });

      const data = await response.json();
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content?.[0]?.text || 'Lo siento, hubo un error. Intenta de nuevo.',
      };

      setMessages(prev => [...prev, assistantMessage]);
      scrollToBottom();

    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickChip = (key) => {
    const questions = {
      predictions: t('ia_quick_predictions') + ' - ¿Quién tiene más probabilidades de ganar hoy?',
      curious: t('ia_quick_curious') + ' - Cuéntame un dato curioso del fútbol',
      analysis: t('ia_quick_analysis') + ' - Analiza el partido más importante de hoy',
    };
    sendMessage(questions[key]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.cardBorder,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 18 }}>🤖</Text>
          </LinearGradient>
          <View>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 15 }}>
              FutHub IA
            </Text>
            <Text style={{ color: colors.live, fontFamily: fonts.regular, fontSize: 11 }}>
              ● En línea
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setMessages([{ id: '0', role: 'assistant', content: t('ia_welcome') }])}>
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13 }}>
            🗑 Limpiar
          </Text>
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
        <View style={{
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}>
          {QUICK_CHIPS.map(chip => (
            <TouchableOpacity
              key={chip.key}
              onPress={() => handleQuickChip(chip.key)}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderWidth: 0.5,
                borderColor: colors.cardBorder,
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 10,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 14 }}>{chip.icon}</Text>
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 }}>
                {t(`ia_quick_${chip.key}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 0.5,
          borderTopColor: colors.cardBorder,
          gap: 10,
        }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderWidth: 0.5,
              borderColor: colors.cardBorder,
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: colors.textPrimary,
              fontFamily: fonts.regular,
              fontSize: 14,
              maxHeight: 100,
            }}
            placeholder={t('ia_placeholder')}
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            <LinearGradient
              colors={input.trim() && !isLoading
                ? [colors.gradientStart, colors.gradientMid]
                : [colors.card, colors.card]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: 44, height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 0.5,
                borderColor: input.trim() && !isLoading ? colors.gradientStart : colors.cardBorder,
              }}
            >
              <Text style={{ fontSize: 18 }}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
