import { useDatabase } from "@/components/DataContext";
import Header from "@/components/Header";
import { formatTime } from "@/modules/Util";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

function base64ToBlob(base64: string, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

const Recorder = () => {
  const [state, setState] = useState<"recording" | "paused" | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [time, setTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showToast = useCallback(() => {
    setToastVisible(true);
  }, []);

  useEffect(() => {
    if (toastVisible) {
      const id = setTimeout(() => {
        setToastVisible(false);
      }, 1000);
      return () => {
        clearTimeout(id);
      };
    }
  }, [toastVisible]);

  const { create } = useDatabase();
  const router = useRouter();

  const transcribeAudio = useCallback(
    async ({ url, ext }: { url: string; ext: string }) => {
      const response = await fetch(url);
      const audioBlob = await response.blob();

      const formData = new FormData();
      formData.append("file", audioBlob, `recording.${ext}`);

      const transcriptionResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = (await transcriptionResponse.json()) as {
        transcription: {
          text: string;
          segments: { start: number; end: number; text: string }[];
        };
      };
      console.log("data", data);
      const id = `${Date.now()}`;
      create({
        id,
        text: data.transcription.text,
        scripts: data.transcription.segments.map((seg) => ({
          start: seg.start,
          end: seg.end,
          text: seg.text.trim(),
        })),
      });
      router.push(`/recording/${id}`);
    },
    [create, router]
  );

  const onStartRecord = useCallback(() => {
    setTime(0);
    setAudioUrl(null);
    startTimer();
    setState("recording");
  }, [startTimer]);

  const onStopRecord = useCallback(
    ({ url, ext }: { url: string; ext: string }) => {
      setAudioUrl(url);
      setState(null);
      stopTimer();
      showToast();
      transcribeAudio({ url, ext });
    },
    [stopTimer, showToast, transcribeAudio]
  );

  const onPauseRecord = useCallback(() => {
    stopTimer();
    setState("paused");
  }, [stopTimer]);

  const onResumeRecord = useCallback(() => {
    startTimer();
    setState("recording");
  }, [startTimer]);

  const hasReactNativeWebview =
    typeof window != "undefined" && window.ReactNativeWebView != null;

  const postMessageToRN = useCallback(
    ({ type, data }: { type: string; data?: any }) => {
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type, data }));
    },
    []
  );

  useEffect(() => {
    if (hasReactNativeWebview) {
      const handleMessage = (event: any) => {
        console.log("handleMessage", event);
        const { type, data } = JSON.parse(event.data);
        if (type === "onStartRecord") {
          onStartRecord();
        } else if (type === "onStopRecord") {
          const { audio, mimeType, ext } = data;
          const blob = base64ToBlob(audio, mimeType);
          const url = URL.createObjectURL(blob);

          onStopRecord({ url, ext });
        } else if (type === "onPauseRecord") {
          onPauseRecord();
        } else if (type === "onResumeRecord") {
          onResumeRecord();
        }
      };
      window.addEventListener("message", handleMessage);
      document.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
        document.removeEventListener("message", handleMessage);
      };
    }
  }, [
    hasReactNativeWebview,
    onStartRecord,
    onStopRecord,
    onPauseRecord,
    onResumeRecord,
  ]);

  const record = useCallback(() => {
    if (hasReactNativeWebview) {
      postMessageToRN({ type: "start-record" });
      return;
    }

    window.navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const mimeType = "audio/webm";
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.onstart = () => {
          onStartRecord();
        };
        mediaRecorder.ondataavailable = (event) => {
          chunksRef.current.push(event.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: chunksRef.current[0].type,
          });
          chunksRef.current = [];
          const url = URL.createObjectURL(blob);
          onStopRecord({ url, ext: "webm" });
          stream.getAudioTracks().forEach((track) => track.stop());
        };
        mediaRecorder.start();
      });
  }, [onStartRecord, onStopRecord, hasReactNativeWebview, postMessageToRN]);

  const stop = useCallback(() => {
    if (hasReactNativeWebview) {
      postMessageToRN({ type: "stop-record" });
      return;
    }

    if (mediaRecorderRef.current != null) {
      mediaRecorderRef.current.stop();
    }
  }, [hasReactNativeWebview, postMessageToRN]);

  const pause = useCallback(() => {
    if (hasReactNativeWebview) {
      postMessageToRN({ type: "pause-record" });
      return;
    }

    if (mediaRecorderRef.current != null) {
      mediaRecorderRef.current.pause();
    }
  }, [hasReactNativeWebview, postMessageToRN]);

  const resume = useCallback(() => {
    if (hasReactNativeWebview) {
      postMessageToRN({ type: "resume-record" });
      return;
    }

    if (mediaRecorderRef.current != null) {
      mediaRecorderRef.current.resume();
    }
  }, [hasReactNativeWebview, postMessageToRN]);

  const onPressRecord = useCallback(() => {
    record();
  }, [record]);

  const onPressSave = useCallback(() => {
    stop();
  }, [stop]);

  const onPressPause = useCallback(() => {
    if (state === "recording") {
      pause();
      onPauseRecord();
    } else if (state === "paused") {
      resume();
      onResumeRecord();
    }
  }, [pause, resume, state, onPauseRecord, onResumeRecord]);

  return (
    <div className="h-screen bg-white flex flex-col">
      <Header title="녹음하기" />
      <div className="flex flex-1 flex-col items-center pt-[211px]">
        {state === "recording" ? (
          <button
            className="w-[120px] h-[120px] rounded-[80px] bg-[#1A1A1A]"
            onClick={onPressPause}
          >
            <span className="material-icons text-white text-[70px]">mic</span>
          </button>
        ) : state === "paused" ? (
          <button
            className="w-[120px] h-[120px] rounded-[80px] bg-[#1A1A1A]"
            onClick={onPressPause}
          >
            <span className="material-icons text-white text-[70px]">pause</span>
          </button>
        ) : (
          <button
            className="w-[120px] h-[120px] rounded-[80px] bg-[#1A1A1A]"
            onClick={onPressRecord}
          >
            <span className="material-icons text-[#09CC7F] text-[70px]">
              mic
            </span>
          </button>
        )}
        <p
          className={`mt-[42px] text-[20px] font-[600] ${
            state === "recording" || state === "paused"
              ? "text-[#303030]"
              : "text-[#AEAEB2]"
          }`}
        >
          {formatTime(time)}
        </p>
        {state === "recording" && (
          <button
            className="mt-[42px] bg-[#1A1A1A] rounded-[27px] px-[42px] py-[16px] items-center flex"
            onClick={onPressPause}
          >
            <span className="material-icons text-white text-[20px]">pause</span>
            <span className="ml-[4px] text-[15px] text-white font-[600]">
              일시 정지
            </span>
          </button>
        )}
        {(state === "recording" || state === "paused") && (
          <button
            className={`${
              state === "paused" ? "mt-[42px]" : "mt-[16px]"
            } bg-[#09CC7F] rounded-[27px] px-[42px] py-[16px] items-center flex`}
            onClick={onPressSave}
          >
            <span className="material-icons text-white text-[20px]">check</span>
            <span className="ml-[4px] text-[15px] text-white font-[600]">
              저장 하기
            </span>
          </button>
        )}
        {toastVisible && (
          <div className="absolute bottom-[21px] flex border-[1.5px] border-[#09CC7F] w-[358px] py-[13px] px-[17px] rounded-[6px] bg-[#F9FEFF]">
            <span className="material-icons text-[#00DDA8] text-[24px]">
              check
            </span>
            <p className="ml-[7px] text-[15px] font-[600] text-[#4A4A4A]">
              저장이 완료되었습니다.
            </p>
          </div>
        )}
        {audioUrl != null && (
          <audio controls>
            <source src={audioUrl} />
          </audio>
        )}
      </div>
    </div>
  );
};

export default Recorder;
