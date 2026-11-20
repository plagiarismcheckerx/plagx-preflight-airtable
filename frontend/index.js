// Plagx Draft Preflight for Airtable: checks a text field of the selected record for length,
// citations against the reference list, punctuation and basic grammar. Read-only: the
// extension never writes to the base. The checks run in the extension, in the browser.
import React, { useState } from 'react';
import {
  Box, Button, FieldPickerSynced, FormField, Heading, Input, Link, SelectButtons, TablePickerSynced, Text,
  expandRecordPickerAsync, initializeBlock, useBase, useCursor, useGlobalConfig, useLoadable, useRecordById,
  useRecords, useWatchable,
} from '@airtable/blocks/ui';
import { FieldType } from '@airtable/blocks/models';
import { checkDraft } from './lib/index.js';
import { cellToText } from './text.js';

const TEXT_FIELDS = [FieldType.MULTILINE_TEXT, FieldType.RICH_TEXT, FieldType.SINGLE_LINE_TEXT];
const LEVELS = { error: 'Error', warning: 'Warning', info: 'Suggestion' };
const LEVEL_COLORS = { error: '#c5221f', warning: '#b06000', info: '#1d4fe0' };
const CREDIT_URL = 'https://plagiarismcheckerx.com/?utm_source=plagx-preflight-airtable';

const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const plain = (msg) => {
  const text = msg.replace(/^Suggestion: /, '');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

function Stat({ value, label }) {
  return (
    <Box backgroundColor="#eef3ff" borderRadius="large" padding={2} flex="1 1 40%" minWidth="90px">
      <Text size="xlarge" fontWeight="strong" textColor="#1d4fe0">{String(value)}</Text>
      <Text size="small" textColor="light">{label}</Text>
    </Box>
  );
}

function Results({ result }) {
  const { stats } = result;
  return (
    <Box marginTop={3}>
      <Box display="flex" flexWrap="wrap" style={{ gap: 6 }}>
        <Stat value={stats.words} label="Words" />
        <Stat value={stats.readingTimeMinutes} label="Min read" />
        <Stat value={stats.sentences} label="Sentences" />
        <Stat value={stats.paragraphs} label="Paragraphs" />
      </Box>
      <Text marginY={2} textColor="light">
        {count(result.errors, 'error')} · {count(result.warnings, 'warning')} · {count(result.infos, 'suggestion')}
      </Text>
      {result.issues.length === 0 ? (
        <Box backgroundColor="#e6f4ea" borderRadius="large" padding={2}>
          <Text textColor="#137333" fontWeight="strong">✓ No issues found.</Text>
        </Box>
      ) : (
        result.issues.map((issue, i) => (
          <Box
            key={i}
            border="thick"
            borderRadius="large"
            padding={2}
            marginBottom={2}
            style={{ borderLeft: `3px solid ${LEVEL_COLORS[issue.level]}` }}
          >
            <Text size="small" fontWeight="strong" textColor={LEVEL_COLORS[issue.level]} style={{ textTransform: 'uppercase' }}>
              {LEVELS[issue.level]}
            </Text>
            <Text>{plain(issue.message)}</Text>
            {issue.text ? (
              <Text size="small" textColor="light" fontFamily="monospace" marginTop={1}>
                {issue.text.length > 120 ? `${issue.text.slice(0, 120)}…` : issue.text}
              </Text>
            ) : null}
          </Box>
        ))
      )}
    </Box>
  );
}

/** "Choose record" button: loads the table's records only when it is shown. */
function ChooseRecord({ table, field, onChoose }) {
  const records = useRecords(table, { fields: [table.primaryField, field] });
  return (
    <Button
      icon="search"
      size="small"
      onClick={async () => {
        const record = await expandRecordPickerAsync(records, { fields: [table.primaryField, field] });
        if (record) onChoose(record.id);
      }}
    >
      Choose record
    </Button>
  );
}

function Checker({ table, field }) {
  const cursor = useCursor();
  useLoadable(cursor);
  useWatchable(cursor, ['selectedRecordIds', 'activeTableId']);
  const [chosenId, setChosenId] = useState(null);
  const [style, setStyle] = useState('apa');
  const [minWords, setMinWords] = useState('');
  const [maxWords, setMaxWords] = useState('');
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState('');

  const selectedId = cursor.activeTableId === table.id ? cursor.selectedRecordIds[0] : undefined;
  const recordId = selectedId || chosenId;
  const record = useRecordById(table, recordId || '', { fields: [table.primaryField, field] });

  const run = () => {
    setResult(null);
    const text = record ? cellToText(record.getCellValueAsString(field)) : '';
    if (!text) {
      setNotice(`“${field.name}” is empty for this record.`);
      return;
    }
    setNotice('');
    const number = (v) => Number.parseInt(v, 10) || undefined;
    setResult(checkDraft(text, { style, minWords: number(minWords), maxWords: number(maxWords) }));
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={2} style={{ gap: 8 }}>
        <Text textColor="light" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {record ? <>Record: <strong>{record.name || 'Unnamed record'}</strong></> : 'Select a record in the grid, or choose one.'}
        </Text>
        <ChooseRecord table={table} field={field} onChoose={(id) => { setChosenId(id); setResult(null); }} />
      </Box>
      <Box display="flex" style={{ gap: 8 }}>
        <FormField label="Min words" flex="1"><Input type="number" min={0} value={minWords} onChange={(e) => setMinWords(e.target.value)} placeholder="0" /></FormField>
        <FormField label="Max words" flex="1"><Input type="number" min={0} value={maxWords} onChange={(e) => setMaxWords(e.target.value)} placeholder="0" /></FormField>
      </Box>
      <FormField label="Citation style">
        <SelectButtons value={style} onChange={setStyle} options={[{ value: 'apa', label: 'APA' }, { value: 'mla', label: 'MLA' }]} />
      </FormField>
      <Button variant="primary" width="100%" disabled={!record} onClick={run}>Check draft</Button>
      {notice ? <Text marginTop={3} textColor="light">{notice}</Text> : null}
      {result ? <Results result={result} /> : null}
    </Box>
  );
}

function PreflightApp() {
  const base = useBase();
  const globalConfig = useGlobalConfig();
  const table = base.getTableByIdIfExists(globalConfig.get('tableId'));
  const field = table ? table.getFieldByIdIfExists(globalConfig.get('fieldId')) : null;

  return (
    <Box padding={3} paddingBottom={4}>
      <Heading size="small" marginBottom={1}>Plagx Draft Preflight</Heading>
      <Text textColor="light" marginBottom={3}>
        Check a draft before you publish: length, citations, punctuation and basic grammar.
      </Text>
      <Box display="flex" style={{ gap: 8 }}>
        <FormField label="Table" flex="1">
          <TablePickerSynced globalConfigKey="tableId" onChange={() => globalConfig.setAsync('fieldId', null)} />
        </FormField>
        {table ? (
          <FormField label="Text field" flex="1">
            <FieldPickerSynced table={table} globalConfigKey="fieldId" allowedTypes={TEXT_FIELDS} placeholder="Pick a text field" />
          </FormField>
        ) : null}
      </Box>
      {table && field ? (
        <Checker table={table} field={field} />
      ) : (
        <Text textColor="light">Pick the table and the long-text or rich-text field that holds your drafts.</Text>
      )}
      <Box borderTop="thick" marginTop={4} paddingTop={2}>
        <Text size="small" textColor="light" marginBottom={1}>
          Put your reference list under a heading or line such as References or Works Cited. Automated suggestions only;
          the extension reads your base but never changes it, and nothing is sent anywhere.
        </Text>
        <Text size="small" textColor="light">
          Made by Plagiarism Checker X. For full plagiarism checking and AI-text detection, visit{' '}
          <Link href={CREDIT_URL} target="_blank" size="small">Text Similarity Detector</Link>.
        </Text>
      </Box>
    </Box>
  );
}

initializeBlock(() => <PreflightApp />);
