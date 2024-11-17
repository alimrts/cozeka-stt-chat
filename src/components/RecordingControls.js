import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { PuffLoader } from "react-spinners";
import { Switch } from "antd";
import axios from "axios";
import toast from "react-hot-toast";

const RecordingControls = ({ setInputMessage, apiBaseUrl, username }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const audioChunks = useRef([]);
  const intervalId = useRef(null);
  const shouldSendRecordingStatus = useRef(true);
  const requestCounter = useRef(1);

  const handleToggle = (checked) => {
    setIsOn(checked);
  };

  const startSingleRecording = async (e) => {
    // Prevent form submission
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    setVisible(false);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const newMediaRecorder = new MediaRecorder(newStream);

      const chunks = [];
      newMediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      newMediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      newMediaRecorder.start();
      setMediaRecorder(newMediaRecorder);
      setMediaStream(newStream);
    } catch (error) {
      console.error("Microphone access denied:", error);
      setLoading(false);
      toast.error("Could not access microphone");
    }
  };

  const stopSingleRecording = (e) => {
    // Prevent form submission
    e.preventDefault();
    e.stopPropagation();

    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaStream.getTracks().forEach((track) => track.stop());
      setVisible(true);
    }
  };

  const startChunkedRecording = (e) => {
    // Prevent form submission
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    setVisible(false);
    setRecording(true);
  };

  const stopChunkedRecording = (e) => {
    // Prevent form submission
    e.preventDefault();
    e.stopPropagation();

    setVisible(true);
    setRecording(false);
    if (mediaRecorder && mediaRecorder.state === "recording") {
      shouldSendRecordingStatus.current = false;
      mediaRecorder.stop();
    }
  };

  const sendBlobToAPI = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append("file", audioBlob);

    try {
      const response = await axios.post(`${apiBaseUrl}upload-audio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setInputMessage(response.data);
      setLoading(false);
      toast.success("Audio processed successfully");
    } catch (error) {
      setLoading(false);
      console.error("Error uploading the audio file:", error);
      toast.error("Failed to process audio");
    }
  };

  const sendChunkToServer = (audioBlob, isRecording) => {
    const formData = new FormData();
    const filename = username;
    formData.append("file", audioBlob, filename);
    formData.append("recording", isRecording);
    formData.append("firstrecord", requestCounter.current);

    axios
      .post(`${apiBaseUrl}upload-chunk`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.data) {
          setInputMessage(response.data);
        }
        requestCounter.current++;
        if (!isRecording) {
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error uploading the audio file:", error);
        toast.error("Failed to send audio chunk");
      });
  };

  useEffect(() => {
    if (audioBlob && !isOn) {
      sendBlobToAPI();
    }
  }, [audioBlob]);

  useEffect(() => {
    if (recording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        setMediaStream(stream);
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.start();

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (audioChunks.current.length > 0) {
            const blob = new Blob(audioChunks.current, {
              type: "audio/webm",
            });
            if (shouldSendRecordingStatus.current) {
              sendChunkToServer(blob, recording);
            } else {
              sendChunkToServer(blob, false);
              shouldSendRecordingStatus.current = true;
            }
            audioChunks.current = [];
          }
        };

        intervalId.current = setInterval(() => {
          if (recorder.state === "recording") {
            recorder.stop();
            recorder.start();
          }
        }, 3000);
      });
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      clearInterval(intervalId.current);
    }

    return () => {
      clearInterval(intervalId.current);
    };
  }, [recording]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        {visible ? (
          <button
            type="button" // Prevent form submission
            onClick={isOn ? startChunkedRecording : startSingleRecording}
            className="p-2 md:p-3 bg-green-600 hover:bg-green-700 rounded-lg focus:outline-none transition-colors duration-200"
            title="Start Recording"
          >
            <FaMicrophone className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        ) : (
          <button
            type="button" // Prevent form submission
            onClick={isOn ? stopChunkedRecording : stopSingleRecording}
            className="p-2 md:p-3 bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none transition-colors duration-200 animate-pulse"
            title="Stop Recording"
          >
            <FaStop className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}
      </div>

      <div className="flex-shrink-0 min-w-[40px] text-center">
        {loading ? (
          <div className="flex justify-center">
            <PuffLoader size={30} color="white" />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-white text-sm font-bold mb-1">
              {isOn ? "Chunk" : "Single"}
            </p>
            <Switch
              checked={isOn}
              onChange={handleToggle}
              disabled={!visible}
              size="small"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingControls;
