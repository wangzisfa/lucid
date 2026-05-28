'use client';

import { createContext, useContext } from 'react';

/**
 * Lets modals (menu sheet, preview sheet, …) portal into the outer phone
 * frame instead of being trapped inside whatever positioned ancestor they
 * happen to be rendered under (e.g. `TermAppBar`, which is `position:
 * relative` to keep its z-index honest).
 *
 * Both `<TermPhone>` and `<LandTermPhone>` provide their outer 320×660 /
 * 660×320 wrapper element here; consumers use `usePhoneRoot()` +
 * `createPortal` to attach above all in-phone chrome.
 */
export const PhoneRootContext = createContext<HTMLDivElement | null>(null);

export const usePhoneRoot = (): HTMLDivElement | null => useContext(PhoneRootContext);
