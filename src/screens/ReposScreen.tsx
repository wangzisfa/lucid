import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { colors, fonts } from '@/theme/tokens';
import { repos } from '@/lib/mock-data';
import { toneColor } from '@/lib/types';
import { useSessions } from '@/lib/store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'Repos'>;

export function ReposScreen({ navigation }: Props) {
  const spawnSession = useSessions((s) => s.spawnSession);

  return (
    <Screen>
      <TermAppBar title="repos" />
      <FlatList
        data={repos}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              spawnSession(item);
              navigation.navigate('Session');
            }}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.rowHead}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={[styles.state, { color: toneColor(item.tone) }]}>
                {item.state}
              </Text>
            </View>
            <Text style={styles.meta}>
              {item.branch} · {item.stack} · {item.ageLabel}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 8 },
  row: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.bgElev1,
    gap: 4,
  },
  rowPressed: { backgroundColor: colors.bgElev2 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 14 },
  state: { fontFamily: fonts.monoFallback, fontSize: 11, letterSpacing: 0.6 },
  meta: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 11 },
});
