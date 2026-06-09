import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: '#05070c',
  },
  bgLight: {
    backgroundColor: '#f4f6fa',
  },
  cardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  borderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  borderLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerUser: {
    fontSize: 11,
    color: '#9ca3af',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  statNum: {
    fontWeight: '700',
    color: '#6366f1',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 3,
    borderRadius: 8,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  filterBar: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  pillBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnActive: {
    backgroundColor: '#6366f1',
  },
  pillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  pillLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    gap: 10,
  },
  loader: {
    marginTop: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#6366f1',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
  },
  modalScroll: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  devName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  devBio: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  btnPrimary: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDanger: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
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
  alarmCard: {
    width: '85%',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  alarmHeader: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  alarmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ef4444',
  },
  alarmBody: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  alarmTaskTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  alarmTaskDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  alarmWarningText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  btnAcknowledge: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
});

export default styles;
