import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { VimBar } from '@/components/form/VimBar';
import { colors, fonts } from '@/theme/tokens';
import { fileNodes, rootFileIds, fileContent } from '@/lib/mock-files';
import { useFiles } from '@/lib/files-store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'Files'>;

/** Flatten the tree honoring open folders, for a vim-style list. */
function visibleRows(open: Set<string>): string[] {
  const out: string[] = [];
  const walk = (ids: string[]) => {
    for (const id of ids) {
      out.push(id);
      const node = fileNodes[id];
      if (node?.kind === 'folder' && open.has(id) && node.children) walk(node.children);
    }
  };
  walk(rootFileIds);
  return out;
}

export function FilesScreen(_props: Props) {
  const open = useFiles((s) => s.openFolders);
  const cursor = useFiles((s) => s.cursor);
  const selected = useFiles((s) => s.selectedFile);
  const search = useFiles((s) => s.search);
  const setCursor = useFiles((s) => s.setCursor);
  const setSelected = useFiles((s) => s.setSelected);
  const setSearch = useFiles((s) => s.setSearch);
  const toggleFolder = useFiles((s) => s.toggleFolder);
  const openFolder = useFiles((s) => s.openFolder);

  const [searching, setSearching] = useState(false);

  // When searching, flatten every matching node; otherwise honor open folders.
  const rows = useMemo(() => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return Object.values(fileNodes)
        .filter((n) => n.name.toLowerCase().includes(q))
        .map((n) => n.id);
    }
    return visibleRows(open);
  }, [open, search]);

  const cursorIdx = Math.max(0, rows.indexOf(cursor));
  const move = (delta: number) => {
    const next = rows[Math.min(rows.length - 1, Math.max(0, cursorIdx + delta))];
    if (next) setCursor(next);
  };
  const top = () => rows[0] && setCursor(rows[0]);
  const openCursor = () => {
    const node = fileNodes[cursor];
    if (!node) return;
    if (node.kind === 'folder') openFolder(cursor);
    else setSelected(cursor);
  };
  const toggleSearch = () => {
    if (searching) { setSearch(''); setSearching(false); }
    else setSearching(true);
  };

  const previewNode = selected ? fileNodes[selected] : null;
  const previewBody = selected ? fileContent[selected] ?? '// no preview available' : '';
  const previewLines = previewBody.split('\n');

  return (
    <Screen>
      <TermAppBar title="~/idea-garden · files" chip="EDIT" />

      {searching && (
        <View style={styles.searchRow}>
          <Text style={styles.searchSlash}>/</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="search files"
            placeholderTextColor={colors.textLo}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput}
          />
          <Pressable onPress={toggleSearch} hitSlop={8}><Text style={styles.searchClose}>esc</Text></Pressable>
        </View>
      )}

      {/* tree */}
      <ScrollView style={styles.tree} contentContainerStyle={styles.treeBody}>
        {rows.map((id) => {
          const node = fileNodes[id];
          if (!node) return null;
          const sel = cursor === id;
          const isSelFile = selected === id;
          const pad = search.trim() ? 12 : 12 + node.depth * 16;
          return (
            <Pressable
              key={id}
              onPress={() => {
                setCursor(id);
                if (node.kind === 'folder') toggleFolder(id);
                else setSelected(id);
              }}
              style={[styles.row, { paddingLeft: pad }, sel && styles.rowSel]}
            >
              <Text style={styles.cursorCol}>{sel ? '›' : ' '}</Text>
              <Text style={[styles.name, node.kind === 'folder' && styles.folder, isSelFile && styles.nameSel]}>
                {node.kind === 'folder' ? (open.has(id) ? '▾ ' : '▸ ') : '  '}
                {node.name}
              </Text>
            </Pressable>
          );
        })}
        {rows.length === 0 && <Text style={styles.empty}>no matches for "{search}"</Text>}
      </ScrollView>

      {/* preview */}
      <View style={styles.preview}>
        <View style={styles.previewHead}>
          <Text style={styles.previewPath} numberOfLines={1}>
            {previewNode ? `~/${previewNode.id}` : 'no file selected'}
          </Text>
          {previewNode && (
            <Text style={styles.previewMeta}>{previewNode.lang ?? 'txt'} · {previewLines.length} ln</Text>
          )}
        </View>
        <ScrollView style={styles.previewBody} contentContainerStyle={styles.previewBodyContent}>
          {previewNode ? (
            previewLines.map((ln, i) => (
              <View key={i} style={styles.codeLine}>
                <Text style={styles.gutter}>{String(i + 1).padStart(2, ' ')}</Text>
                <Text style={styles.code}>{ln || ' '}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>l to open · tap a file to preview</Text>
          )}
        </ScrollView>
      </View>

      {/* vim command bar */}
      <View style={styles.cmdBar}>
        <CmdKey label="k" onPress={() => move(-1)} />
        <CmdKey label="j" onPress={() => move(1)} />
        <CmdKey label="l" onPress={openCursor} />
        <CmdKey label="gg" onPress={top} />
        <CmdKey label="/" onPress={toggleSearch} active={searching} />
        <Text style={styles.cmdHint}>j/k move · l open · gg top · / search</Text>
      </View>
      <VimBar mode={searching ? 'INSERT' : 'NORMAL'} cmd=":files" hint={`${cursorIdx + 1}/${rows.length}`} />
    </Screen>
  );
}

function CmdKey({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.key, active && styles.keyActive]} hitSlop={6}>
      <Text style={[styles.keyText, active && styles.keyTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.glassBorder },
  searchSlash: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 13 },
  searchInput: { flex: 1, color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 12, padding: 0 },
  searchClose: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 10 },
  tree: { flex: 1 },
  treeBody: { paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingRight: 12 },
  rowSel: { backgroundColor: 'rgba(255,138,180,0.08)' },
  cursorCol: { width: 12, color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 12 },
  name: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 13 },
  folder: { color: colors.cyan },
  nameSel: { color: colors.textHi },
  empty: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 11, padding: 12 },
  preview: { height: '40%', borderTopWidth: 1, borderTopColor: colors.glassBorder, backgroundColor: 'rgba(0,0,0,0.35)' },
  previewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.glassBorder },
  previewPath: { flex: 1, color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 10.5 },
  previewMeta: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  previewBody: { flex: 1 },
  previewBodyContent: { padding: 8 },
  codeLine: { flexDirection: 'row', gap: 8 },
  gutter: { color: colors.textDisabled, fontFamily: fonts.monoFallback, fontSize: 11, lineHeight: 17 },
  code: { flex: 1, color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 11, lineHeight: 17 },
  cmdBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.glassBorder },
  key: { minWidth: 26, alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, borderWidth: 1, borderColor: colors.glassBorderBright, backgroundColor: 'rgba(0,0,0,0.4)' },
  keyActive: { borderColor: colors.rose, backgroundColor: 'rgba(255,138,180,0.12)' },
  keyText: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 11 },
  keyTextActive: { color: colors.rose },
  cmdHint: { marginLeft: 'auto', color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9 },
});
