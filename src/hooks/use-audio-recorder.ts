'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderError = 'unsupported' | 'permission-denied' | 'failed';

interface UseAudioRecorderOptions {
  /** Called with the finished recording when the user stops recording. */
  onRecordingComplete: (recording: Blob) => void;
  onError: (error: RecorderError) => void;
}

/** Thin wrapper around `MediaRecorder` that always releases the microphone. */
export function useAudioRecorder({ onRecordingComplete, onError }: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const callbacksRef = useRef({ onRecordingComplete, onError });
  callbacksRef.current = { onRecordingComplete, onError };

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      callbacksRef.current.onError('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        releaseStream();
        setIsRecording(false);
        // Use the recorder's real MIME type: Chrome records WebM, Safari records MP4.
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size > 0) callbacksRef.current.onRecordingComplete(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      releaseStream();
      const denied = error instanceof DOMException && error.name === 'NotAllowedError';
      callbacksRef.current.onError(denied ? 'permission-denied' : 'failed');
    }
  }, [releaseStream]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    recorderRef.current = null;
  }, []);

  // Release the microphone if the component unmounts mid-recording.
  useEffect(
    () => () => {
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
      releaseStream();
    },
    [releaseStream]
  );

  return { isRecording, start, stop };
}
