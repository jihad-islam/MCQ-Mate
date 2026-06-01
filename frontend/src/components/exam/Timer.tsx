'use client';

import { Question } from '@/lib/api';
import { useEffect, useState } from 'react';
import DesktopTimer from './DesktopTimer';
import MobileTimer from './MobileTimer';

interface TimerProps {
  timeLimit: number; // in minutes
  questions: Question[];
}

export default function Timer({ timeLimit, questions }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(timeLimit * 60); // convert to seconds
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Timer countdown logic
  useEffect(() => {
    if (timeLimit <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit]);

  // Dispatch event when time is up
  useEffect(() => {
    if (isTimeUp && timeLimit > 0 && timeRemaining <= 0) {
      window.dispatchEvent(new CustomEvent('timeUp'));
    }
  }, [isTimeUp, timeLimit, timeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = timeRemaining < 60; // Less than 1 minute

  return (
    <>
      <DesktopTimer 
        formattedTime={formattedTime} 
        isLowTime={isLowTime} 
        questions={questions} 
      />
      <MobileTimer 
        formattedTime={formattedTime} 
        isLowTime={isLowTime} 
        questions={questions} 
      />
    </>
  );
}