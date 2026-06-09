import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import styles from './AboutDeveloperStyles';

// REACT DEV CONCEPT: Presentational Component
// This component has no internal state and purely renders UI based on the `theme` prop.
export default function AboutDeveloper({ theme, onClose }) {
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.modalContainer, isDark ? styles.bgDark : styles.bgLight]}>
      <ScrollView contentContainerStyle={styles.modalScroll}>
        <Text style={[styles.modalTitle, isDark ? styles.textLight : styles.textDark]}>About Developer</Text>
        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, { alignItems: 'center', marginVertical: 20 }]}>
          <Text style={[styles.devName, isDark ? styles.textLight : styles.textDark]}>Akshat Raj</Text>
          <Text style={styles.subtitle}>Software Engineer & Project Architect</Text>
          <Text style={[styles.devBio, { color: isDark ? '#9ca3af' : '#4b5563', marginTop: 12 }]}>
            Author and builder of the SyncTask ecosystem. Developed using modern cross-platform technologies to combat task deadline blindness.
          </Text>
        </View>
        <TouchableOpacity style={styles.btnDanger} onPress={onClose}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
