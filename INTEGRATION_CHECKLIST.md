# Integration Checklist

Copy this checklist and check items off as you complete them!

## Pre-Integration Verification

- [ ] I've read `QUICK_START.md`
- [ ] I've read `INTEGRATION_GUIDE.md`
- [ ] I've viewed `design-mockups/design-alternatives.html` in browser
- [ ] My development server is NOT running yet
- [ ] I have my IDE open to the project

## Step 1: Verify Files

- [ ] `src/colors.ts` exists and has new exports (PLAYER_COLORS, etc.)
- [ ] `src/components/` folder exists
- [ ] `src/components/WinnerDisplay.tsx` exists
- [ ] `src/components/WinnerDisplay.css` exists
- [ ] `src/components/CompactHeader.tsx` exists
- [ ] `src/components/CompactHeader.css` exists
- [ ] `src/types/scenario.ts` exists

## Step 2: Update Grid.tsx Imports

- [ ] Opened `src/grid.tsx` in my IDE
- [ ] Found the import section at the top
- [ ] Added: `import WinnerDisplay from './components/WinnerDisplay';`
- [ ] Added: `import CompactHeader from './components/CompactHeader';`
- [ ] Added: `import { PLAYER_COLORS } from './colors';`
- [ ] Saved the file
- [ ] No TypeScript errors showing

## Step 3: Add Winner Calculation

- [ ] Found where `useMemo` hooks are in Grid component
- [ ] Added the `currentWinner` useMemo hook (see INTEGRATION_GUIDE.md)
- [ ] Saved the file
- [ ] No TypeScript errors showing

## Step 4: Identify Button Handlers

Found these existing handlers (or noted I need to create them):
- [ ] Share handler: ________________
- [ ] Summary handler: ________________
- [ ] Show/Hide next handler: ________________
- [ ] Lock/Unlock handler: ________________

## Step 5: Update JSX

- [ ] Found the main `return` statement in Grid component
- [ ] Added `<CompactHeader />` at the top
- [ ] Added `{currentWinner && <WinnerDisplay />}` below header
- [ ] Wired up all button handlers to CompactHeader props
- [ ] Passed correct props to WinnerDisplay
- [ ] Kept all existing JSX intact below
- [ ] Saved the file
- [ ] No TypeScript errors showing

## Step 6: Test

- [ ] Started dev server: `npm start`
- [ ] App loads without errors
- [ ] CompactHeader appears at top
- [ ] All 4 buttons are visible
- [ ] WinnerDisplay does NOT show (no scores yet)
- [ ] No console errors in browser

## Step 7: Test Winner Display

- [ ] Entered some test scores
- [ ] WinnerDisplay appears with trophy icon
- [ ] Shows correct player name
- [ ] Shows correct coordinates
- [ ] Animation plays smoothly
- [ ] Winner updates when scores change

## Step 8: Test Buttons

- [ ] Share button does something
- [ ] Summary button does something
- [ ] Show Next / Hide Next button works
- [ ] Lock / Unlock button works

## Step 9: Test Responsive

- [ ] Resized browser to mobile width
- [ ] Header stacks vertically
- [ ] Buttons wrap appropriately
- [ ] Winner display looks good
- [ ] Grid is still usable
- [ ] No horizontal scrolling

## Step 10: Polish (Optional)

- [ ] Updated Square.tsx to use new PLAYER_COLORS
- [ ] Adjusted any conflicting CSS
- [ ] Tested with different player names
- [ ] Tested with all squares claimed
- [ ] Tested with no squares claimed

## Common Issues Checklist

If something isn't working, check:

- [ ] All imports have correct paths
- [ ] Component names match exactly (case-sensitive)
- [ ] Props match the TypeScript interfaces
- [ ] No typos in component names
- [ ] Browser console shows no errors
- [ ] TypeScript shows no errors in IDE
- [ ] Dev server was restarted after changes
- [ ] Browser cache was cleared if styles look wrong

## Success Criteria

I can confirm:
- [ ] New header is clean and compact
- [ ] Winner display shows and animates nicely
- [ ] No existing functionality broke
- [ ] Mobile layout works
- [ ] No console errors
- [ ] TypeScript is happy
- [ ] I'm happy with how it looks! 🎉

## If Everything Works...

🎊 Congratulations! Phase 1 is complete!

Next steps:
- [ ] Commit your changes to git
- [ ] Take a screenshot of the new look
- [ ] Read `PHASE_2_PLAN.md` for tooltip system (coming next)

## If Something Doesn't Work...

Don't worry! Common fixes:

1. **Imports failing?**
   - Check file paths are correct
   - Make sure components folder exists in src/

2. **TypeScript errors?**
   - Check prop types match interfaces
   - Verify all required props are passed

3. **Winner not showing?**
   - Verify scores are set (not '?')
   - Check console for calculation errors
   - Log `currentWinner` to debug

4. **Styles look weird?**
   - Clear browser cache
   - Check for CSS conflicts in Grid.css
   - Verify CSS files are imported

5. **Still stuck?**
   - Re-read INTEGRATION_GUIDE.md troubleshooting section
   - Check all files are in correct locations
   - Verify no typos in code

---

Good luck! You've got this! 🚀
