/**
 * Resume System Verification Script
 * 
 * Run this in your React Native debugger console to verify the Resume system is working
 */

// 1. Check if Resume reducer is registered
console.log('=== RESUME SYSTEM VERIFICATION ===');
console.log('');

// 2. Check initial state (paste this in debugger console)
const checkResumeState = () => {
  // Get state from Redux DevTools
  // $r.store.getState().resume
  
  const state = $r.store.getState();
  
  console.log('1. Resume State:', state.resume);
  console.log('2. Is Visible:', state.resume?.isVisible);
  console.log('3. Initialized:', state.resume?.initialized);
  console.log('4. Reading Section Started:', state.resume?.reading?.started);
  console.log('5. Reading Last Accessed:', 
    state.resume?.reading?.lastAccessedAt 
      ? new Date(state.resume.reading.lastAccessedAt).toLocaleString() 
      : 'Never'
  );
  console.log('6. Last Resume Target:', state.resume?.reading?.lastResumeTarget);
  console.log('');
  
  // Check MMKV storage
  console.log('=== MMKV STORAGE ===');
  const { resumeStorage } = require('./src/storage/resumeStorage');
  const isVisible = resumeStorage.getBoolean('resume:visible');
  const resumeData = resumeStorage.getString('resume:state');
  console.log('7. MMKV Visible:', isVisible);
  console.log('8. MMKV Data exists:', !!resumeData);
  console.log('9. MMKV Data length:', resumeData?.length || 0);
  console.log('');
  
  return state.resume;
};

// 3. Simulate reading a Surah
const simulateReadingSurah = (surahNo = 1, surahName = 'Al-Fatiha') => {
  console.log(`=== SIMULATING READING SURAH ${surahNo} ===`);
  
  const { store } = require('./src/redux/store');
  const {
    startSection,
    touchSection,
    updateQuranItemProgress,
    setLastResumeTarget,
  } = require('./src/redux/slices/resumeSlice');
  
  // Start reading section
  store.dispatch(startSection('reading'));
  console.log('✓ Started reading section');
  
  // Touch section
  store.dispatch(touchSection('reading'));
  console.log('✓ Touched reading section');
  
  // Update Quran item progress
  store.dispatch(updateQuranItemProgress({
    targetType: 'surah',
    targetId: surahNo,
    updates: {
      startedAt: Date.now(),
      lastAccessedAt: Date.now(),
    },
  }));
  console.log('✓ Updated Quran item progress');
  
  // Set last resume target
  store.dispatch(setLastResumeTarget({
    targetType: 'surah',
    targetId: surahNo,
    verseKey: `${surahNo}:1`,
    name: surahName,
  }));
  console.log('✓ Set last resume target');
  
  console.log('');
  console.log('Checking state after simulation:');
  return checkResumeState();
};

// 4. Check if Resume component will render
const checkResumeVisibility = () => {
  const state = $r.store.getState().resume;
  
  console.log('=== RESUME COMPONENT VISIBILITY CHECK ===');
  console.log('Will Resume show?', state?.isVisible === true);
  console.log('Reason:', state?.isVisible 
    ? '✓ At least one section is started' 
    : '✗ No sections started yet'
  );
  console.log('');
  
  // Check each section
  console.log('Section Status:');
  console.log('- Qaida:', state?.qaida?.started ? '✓ Started' : '✗ Not started');
  console.log('- Quran:', state?.quran?.started ? '✓ Started' : '✗ Not started');
  console.log('- Reading:', state?.reading?.started ? '✓ Started' : '✗ Not started');
  console.log('');
};

// 5. Get progress summary (what Resume component will display)
const getProgressSummary = () => {
  const { selectProgressSummary } = require('./src/redux/slices/resumeSlice');
  const state = $r.store.getState();
  
  const summary = selectProgressSummary(state);
  
  console.log('=== RESUME PROGRESS SUMMARY ===');
  console.log('This is what the Resume component will display:');
  console.log('');
  console.log('Qaida:');
  console.log('  - Completed Items:', summary.qaida.completedItems);
  console.log('  - Total Items:', summary.qaida.totalItems);
  console.log('  - Completion:', summary.qaida.completionPercent + '%');
  console.log('  - Last Accessed:', 
    summary.qaida.lastAccessedAt 
      ? new Date(summary.qaida.lastAccessedAt).toLocaleString() 
      : 'Never'
  );
  console.log('');
  console.log('Quran:');
  console.log('  - Completed Items:', summary.quran.completedItems);
  console.log('  - Total Items:', summary.quran.totalItems);
  console.log('  - Completion:', summary.quran.completionPercent + '%');
  console.log('  - Last Target:', summary.quran.lastTarget);
  console.log('  - Last Accessed:', 
    summary.quran.lastAccessedAt 
      ? new Date(summary.quran.lastAccessedAt).toLocaleString() 
      : 'Never'
  );
  console.log('');
  console.log('Reading:');
  console.log('  - Completed Items:', summary.reading.completedItems);
  console.log('  - Total Items:', summary.reading.totalItems);
  console.log('  - Completion:', summary.reading.completionPercent + '%');
  console.log('  - Last Accessed:', 
    summary.reading.lastAccessedAt 
      ? new Date(summary.reading.lastAccessedAt).toLocaleString() 
      : 'Never'
  );
  console.log('');
  
  return summary;
};

// Export functions for use in console
if (typeof global !== 'undefined') {
  global.checkResumeState = checkResumeState;
  global.simulateReadingSurah = simulateReadingSurah;
  global.checkResumeVisibility = checkResumeVisibility;
  global.getProgressSummary = getProgressSummary;
  
  console.log('');
  console.log('=== VERIFICATION FUNCTIONS LOADED ===');
  console.log('Run these in your debugger console:');
  console.log('');
  console.log('1. checkResumeState()           - Check current Resume state');
  console.log('2. simulateReadingSurah(1, "Al-Fatiha")  - Simulate reading');
  console.log('3. checkResumeVisibility()      - Check if Resume will show');
  console.log('4. getProgressSummary()         - Get display data');
  console.log('');
}

export {
  checkResumeState,
  simulateReadingSurah,
  checkResumeVisibility,
  getProgressSummary,
};
