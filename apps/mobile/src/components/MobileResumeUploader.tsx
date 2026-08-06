import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { CandidateMatchResponse } from '@gatepulse/shared';

interface MobileResumeUploaderProps {
  onMatchComplete: (data: CandidateMatchResponse) => void;
  apiBaseUrl: string;
}

export const MobileResumeUploader: React.FC<MobileResumeUploaderProps> = ({
  onMatchComplete,
  apiBaseUrl,
}) => {
  const [fileAsset, setFileAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selected = result.assets[0];
        if (selected.size && selected.size > 5 * 1024 * 1024) {
          Alert.alert('File Limit Exceeded', 'Please select a CV document smaller than 5MB.');
          return;
        }
        setFileAsset(selected);
      }
    } catch (err) {
      console.warn('Document picking error:', err);
      Alert.alert('Picker Error', 'Could not open document picker on device.');
    }
  };

  const handleUploadCV = async () => {
    if (!fileAsset) {
      Alert.alert('No File Selected', 'Please tap "Select CV File" to pick a document.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      const fileToUpload = {
        uri: fileAsset.uri,
        name: fileAsset.name || 'resume.pdf',
        type: fileAsset.mimeType || 'application/pdf',
      } as any;

      formData.append('resume', fileToUpload);

      const res = await fetch(`${apiBaseUrl}/api/v1/match-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        onMatchComplete(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse CV and match drives');
      }
    } catch (err: any) {
      console.warn('Mobile CV match upload error:', err);
      Alert.alert('CV Match Error', err?.message || 'Could not connect to GatePulse AI server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>📄 Mobile AI CV Matcher</Text>
      <Text style={styles.subTitle}>
        Select your resume (.pdf, .docx, .doc, .txt) up to 5MB to extract skills &amp; experience fit.
      </Text>

      <TouchableOpacity style={styles.pickerBox} activeOpacity={0.8} onPress={pickDocument}>
        <Text style={styles.pickerIcon}>📁</Text>
        {fileAsset ? (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>Selected: {fileAsset.name}</Text>
            <Text style={styles.fileSize}>
              {fileAsset.size ? `${(fileAsset.size / 1024).toFixed(1)} KB` : 'Ready to upload'}
            </Text>
          </View>
        ) : (
          <View style={styles.fileInfo}>
            <Text style={styles.pickerText}>Tap to Select Resume Document</Text>
            <Text style={styles.pickerSub}>PDF, DOCX, DOC, TXT (Max 5MB)</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.uploadButton, (!fileAsset || loading) && styles.buttonDisabled]}
        activeOpacity={0.8}
        onPress={handleUploadCV}
        disabled={!fileAsset || loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.uploadButtonText}>🚀 Match CV with Walk-in Drives</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  title: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subTitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12,
  },
  pickerBox: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: 'bold',
  },
  fileSize: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  pickerText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  pickerSub: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  uploadButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
