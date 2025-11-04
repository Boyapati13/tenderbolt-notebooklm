'use client';

import React from 'react';
import { MotionWrapper } from './motion-wrapper';

// ClientMotionLoader is a thin client wrapper that renders the MotionWrapper
// directly. Avoid using `next/dynamic` here to prevent server-side render
// bailouts in development. MotionWrapper itself is a client component and
// imports framer-motion safely.
export default function ClientMotionLoader({ children }: { children: React.ReactNode }) {
  return <MotionWrapper>{children}</MotionWrapper>;
}
