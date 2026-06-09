import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 10,
    marginVertical: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  completedCard: {
    opacity: 0.5,
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardBody: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 10,
  },
  checkboxUnchecked: {
    borderColor: '#6366f1',
  },
  checkboxChecked: {
    borderColor: '#4b5563',
    backgroundColor: '#4b5563',
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  textLight: {
    color: '#f3f4f6',
  },
  textDark: {
    color: '#1f2937',
  },
  lineThrough: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  desc: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 8,
    lineHeight: 14,
  },
  progressSection: {
    marginTop: 4,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  timeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 8,
    color: '#9ca3af',
    fontWeight: '500',
  },
  completedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
    alignSelf: 'center',
  },
});

export default styles;
