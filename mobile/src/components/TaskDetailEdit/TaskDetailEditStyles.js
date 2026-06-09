import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContentWrapper: {
    justifyContent: 'center',
  },
  modalInnerCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  cardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
  },
  formTitleHeader: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  inputLight: {
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#ffffff',
  },
  inputDark: {
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  textLight: {
    color: '#f3f4f6',
  },
  textDark: {
    color: '#1f2937',
  },
  rowSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  sevBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  sevBtnLowActive: {
    backgroundColor: '#10b981',
  },
  sevBtnMidActive: {
    backgroundColor: '#f97316',
  },
  sevBtnHighActive: {
    backgroundColor: '#ef4444',
  },
  pillLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  pillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sevBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
  },
  checkboxUnchecked: {
    borderColor: '#6366f1',
  },
  checkboxChecked: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f1',
  },
  btnPrimary: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDanger: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default styles;
