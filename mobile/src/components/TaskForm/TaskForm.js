import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import styles from './TaskFormStyles';

let DateTimePicker = null;
if (Platform.OS !== 'web') {
  try {
    const dtpModule = require('@react-native-community/datetimepicker');
    DateTimePicker = dtpModule.default || dtpModule;
  } catch (e) {
    console.log('DateTimePicker not available');
  }
}

// REACT DEV CONCEPT: Controlled Component Form
// This component strictly manages its own form state and uses Inverse Data Flow to send the fully assembled 
// task data back up to the Dashboard Container via `onSubmit`.
export default function TaskForm({ visible, theme, onSubmit, onCancel }) {
  const isDark = theme === 'dark';

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formSeverity, setFormSeverity] = useState('low');
  const [hasCustomAlert, setHasCustomAlert] = useState(false);
  const [formNotificationValue, setFormNotificationValue] = useState('');
  const [formNotificationUnit, setFormNotificationUnit] = useState('none');

  // DatePicker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [tempDate, setTempDate] = useState(new Date());
  const [activeDateField, setActiveDateField] = useState(null);

  function resetForm() {
    setFormTitle('');
    setFormDesc('');
    setFormStartDate('');
    setFormDeadline('');
    setFormSeverity('low');
    setHasCustomAlert(false);
    setFormNotificationValue('');
    setFormNotificationUnit('none');
  }

  function handleDateConfirm(event, selectedDate) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed') return;
    
    if (selectedDate) {
      setTempDate(selectedDate);
      if (pickerMode === 'date') {
        setPickerMode('time');
        if (Platform.OS === 'android') {
          setTimeout(() => setShowDatePicker(true), 50);
        } else {
          setShowDatePicker(true);
        }
      } else {
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const hh = String(selectedDate.getHours()).padStart(2, '0');
        const min = String(selectedDate.getMinutes()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        
        if (activeDateField === 'startDate') {
          setFormStartDate(formatted);
        } else {
          setFormDeadline(formatted);
        }
        setPickerMode('date');
      }
    }
  }

  function openDateTimePicker(field) {
    setActiveDateField(field);
    const val = field === 'startDate' ? formStartDate : formDeadline;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      setTempDate(d);
    } else {
      setTempDate(new Date());
    }
    setPickerMode('date');
    setShowDatePicker(true);
  }

  function handleSubmit() {
    if (!formTitle.trim() || !formDeadline.trim()) {
      Alert.alert('Error', 'Please fill in Title and Deadline');
      return;
    }
    const parsedDate = Date.parse(formDeadline);
    if (isNaN(parsedDate)) {
      Alert.alert('Error', 'Invalid deadline date format');
      return;
    }

    onSubmit({
      title: formTitle,
      description: formDesc,
      startDate: formStartDate,
      deadline: formDeadline,
      severity: formSeverity,
      hasCustomAlert,
      formNotificationValue,
      formNotificationUnit
    });
    
    resetForm();
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContentWrapper}>
          <View style={[styles.modalInnerCard, isDark ? styles.cardDark : { backgroundColor: '#ffffff' }]}>
            <Text style={[styles.formTitleHeader, isDark ? styles.textLight : styles.textDark]}>
              Create New Task
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Task Title</Text>
              <TextInput
                style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textLight : styles.textDark]}
                placeholder="Enter task title"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                value={formTitle}
                onChangeText={setFormTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textLight : styles.textDark, { height: 60 }]}
                placeholder="Enter task details (optional)"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                value={formDesc}
                onChangeText={setFormDesc}
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, { justifyContent: 'center' }]}
                onPress={() => openDateTimePicker('startDate')}
              >
                <Text style={[isDark ? styles.textLight : styles.textDark, !formStartDate && { color: isDark ? '#6b7280' : '#9ca3af' }]}>
                  {formStartDate || "Select start date and time"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Deadline</Text>
              <TouchableOpacity
                style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, { justifyContent: 'center' }]}
                onPress={() => openDateTimePicker('deadline')}
              >
                <Text style={[isDark ? styles.textLight : styles.textDark, !formDeadline && { color: isDark ? '#6b7280' : '#9ca3af' }]}>
                  {formDeadline || "Select date and time"}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && DateTimePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={tempDate}
                mode={pickerMode}
                is24Hour={true}
                display="default"
                onChange={handleDateConfirm}
              />
            )}

            {Platform.OS === 'web' && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: '#ef4444', fontSize: 12 }]}>* Web picker not supported, please type date manually: (YYYY-MM-DD HH:MM)</Text>
                <TextInput
                  style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textLight : styles.textDark]}
                  placeholder="e.g. 2026-06-30 18:00"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  value={formDeadline}
                  onChangeText={setFormDeadline}
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Severity Level</Text>
              <View style={styles.rowSelector}>
                {['low', 'mid', 'high'].map(sev => (
                  <TouchableOpacity
                    key={sev}
                    style={[
                      styles.sevBtn,
                      formSeverity === sev ? (
                        sev === 'low' ? styles.sevBtnLowActive : sev === 'mid' ? styles.sevBtnMidActive : styles.sevBtnHighActive
                      ) : (isDark ? styles.pillDark : styles.pillLight)
                    ]}
                    onPress={() => setFormSeverity(sev)}
                  >
                    <Text style={[
                      styles.sevBtnText,
                      formSeverity === sev ? { color: '#ffffff' } : (isDark ? { color: '#9ca3af' } : { color: '#4b5563' })
                    ]}>
                      {sev.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6, gap: 8 }}
                onPress={() => setHasCustomAlert(!hasCustomAlert)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, hasCustomAlert ? styles.checkboxChecked : styles.checkboxUnchecked]} />
                <Text style={[styles.label, { marginBottom: 0 }]}>Set custom deadline warning alert</Text>
              </TouchableOpacity>
              
              {hasCustomAlert && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <TextInput
                    style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textLight : styles.textDark, { flex: 1 }]}
                    placeholder="e.g. 2"
                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                    keyboardType="numeric"
                    value={formNotificationValue}
                    onChangeText={setFormNotificationValue}
                  />
                  <View style={{ flex: 1.5, flexDirection: 'row', gap: 4 }}>
                    {['min', 'hour', 'day'].map((unit) => {
                      const mappedUnit = unit === 'min' ? 'minutes' : unit === 'hour' ? 'hours' : 'days';
                      const active = formNotificationUnit === mappedUnit;
                      return (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.sevBtn,
                            active ? styles.sevBtnLowActive : (isDark ? styles.pillDark : styles.pillLight)
                          ]}
                          onPress={() => setFormNotificationUnit(mappedUnit)}
                        >
                          <Text style={[styles.sevBtnText, active ? { color: '#ffffff' } : (isDark ? { color: '#9ca3af' } : { color: '#4b5563' })]}>
                            {unit.toUpperCase()}S
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            <View style={[styles.rowSelector, { marginTop: 12, gap: 12 }]}>
              <TouchableOpacity
                style={[styles.btnDanger, { flex: 1 }]}
                onPress={handleCancel}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, { flex: 1, marginTop: 0 }]}
                onPress={handleSubmit}
              >
                <Text style={styles.btnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
