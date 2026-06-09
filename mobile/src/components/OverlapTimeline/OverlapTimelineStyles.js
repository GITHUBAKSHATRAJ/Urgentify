import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarHeader: {
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
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  expandText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366f1',
  },
  navBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
  },
  weekSlider: {
    flexDirection: 'row',
    gap: 8,
  },
  dayPill: {
    width: 44,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayPillActive: {
    backgroundColor: '#6366f1',
    borderColor: 'transparent',
  },
  dayPillToday: {
    borderColor: '#6366f1',
  },
  pillDark: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  pillLight: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 15,
  },
  dayName: {
    fontSize: 7,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
  textWhite: {
    color: '#ffffff',
  },
  textLight: {
    color: '#f3f4f6',
  },
  textDark: {
    color: '#1f2937',
  },
  textMuted: {
    color: 'rgba(255,255,255,0.2)',
  },
  monthlyContainer: {
    width: '100%',
  },
  weekdayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: '600',
    color: '#9ca3af',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayCell: {
    width: `${100 / 7}%`,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginVertical: 1,
    position: 'relative',
  },
  monthDayNum: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeCell: {
    backgroundColor: '#6366f1',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  cellDot: {
    width: 3,
    height: 3,
    backgroundColor: '#9ca3af',
    borderRadius: 1.5,
    position: 'absolute',
    bottom: 3,
  },
  scrollContent: {
    padding: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  overlapAlertBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  overlapAlertText: {
    color: '#f87171',
    fontSize: 9,
    fontWeight: '700',
  },
  ganttContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 180,
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
  yLabelsColumn: {
    width: 60,
    borderRightWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  yBorderDark: {
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
  },
  yBorderLight: {
    borderRightColor: 'rgba(0, 0, 0, 0.06)',
  },
  cornerCell: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  bottomBorderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  bottomBorderLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  cornerText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#9ca3af',
  },
  labelCell: {
    height: 40,
    justifyContent: 'center',
    paddingLeft: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  labelText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#9ca3af',
  },
  gridScroll: {
    flex: 1,
  },
  xAxisRow: {
    height: 24,
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  hourHeaderCell: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  hourText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#9ca3af',
  },
  gridContent: {
    flex: 1,
    position: 'relative',
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  currentTimeMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#d946ef',
    shadowColor: '#d946ef',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  emptyDayContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDayText: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  gridRow: {
    height: 40,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
    justifyContent: 'center',
  },
  ganttPill: {
    position: 'absolute',
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  ganttPillConflict: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderStyle: 'dashed',
  },
  ganttPillTitle: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  overlapFooter: {
    marginTop: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 10,
    padding: 10,
  },
  overlapFooterHeading: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  overlapFooterItem: {
    fontSize: 9,
    color: '#9ca3af',
    lineHeight: 14,
  },
  boldText: {
    fontWeight: '700',
    color: '#f3f4f6',
  },
});

export default styles;
