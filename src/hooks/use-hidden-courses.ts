'use client';

import { useState, useEffect, useCallback } from 'react';

export function useHiddenCourses() {
  const [hiddenCourses, setHiddenCourses] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHiddenCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/hidden-courses');
      if (!response.ok) throw new Error('Failed to fetch hidden courses');
      const data = await response.json();
      setHiddenCourses(data);
    } catch (error) {
      console.error('Error fetching hidden courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHiddenCourses();
  }, [fetchHiddenCourses]);

  const hideCourse = useCallback(async (courseId: number) => {
    // Optimistic update
    setHiddenCourses(prev => [...prev, courseId]);

    try {
      const response = await fetch('/api/hidden-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        // Revert on error
        setHiddenCourses(prev => prev.filter(id => id !== courseId));
        throw new Error('Failed to hide course');
      }
    } catch (error) {
      console.error('Error hiding course:', error);
    }
  }, []);

  const unhideCourse = useCallback(async (courseId: number) => {
    // Optimistic update
    setHiddenCourses(prev => prev.filter(id => id !== courseId));

    try {
      const response = await fetch(`/api/hidden-courses?courseId=${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Revert on error
        setHiddenCourses(prev => [...prev, courseId]);
        throw new Error('Failed to unhide course');
      }
    } catch (error) {
      console.error('Error unhiding course:', error);
    }
  }, []);

  const isHidden = useCallback((courseId: number) => {
    return hiddenCourses.includes(courseId);
  }, [hiddenCourses]);

  return {
    hiddenCourses,
    loading,
    hideCourse,
    unhideCourse,
    isHidden,
  };
}
