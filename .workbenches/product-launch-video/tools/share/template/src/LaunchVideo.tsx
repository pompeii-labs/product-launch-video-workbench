import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import captures from "../capture/index.json";
import manifest from "../manifest.json";
import { FPS } from "./Root";

// STORYBOARD SKELETON written by lvnew. It lays each manifest beat out as a card (act, what the
// viewer sees, first copy line, first shot) so the story can be judged before any motion exists. Replace it beat by beat with the real
// composition; the gate fails while these labels are on screen.

type Beat = (typeof manifest.beats)[number] & { shots?: string[] };

const Card: React.FC<{ beat: Beat }> = ({ beat }) => {
  const file = (captures.shots as Array<{ id: string; file?: string }>).find((s) => s.id === beat.shots?.[0])?.file;
  const media = { marginTop: "auto", maxHeight: 360, objectFit: "contain", alignSelf: "flex-start" } as const;
  return (
    <AbsoluteFill style={{ background: "#0b0b0c", color: "#f4f4f5", fontFamily: "sans-serif", padding: 72, gap: 24 }}>
      <div style={{ fontSize: 22, opacity: 0.6 }}>
        skeleton {beat.act}: {beat.shows}
      </div>
      <div style={{ fontSize: 48, fontWeight: 600, lineHeight: 1.15 }}>{(beat.copy as Array<{ text: string }>)[0]?.text ?? ""}</div>
      {file?.endsWith(".mp4") ? <OffthreadVideo src={staticFile(file)} muted style={media} /> : null}
      {file && !file.endsWith(".mp4") ? <Img src={staticFile(file)} style={media} /> : null}
    </AbsoluteFill>
  );
};

export const LaunchVideo: React.FC = () => (
  <AbsoluteFill style={{ background: "#0b0b0c" }}>
    {(manifest.beats as Beat[]).map((beat) => (
      <Sequence key={beat.id} from={Math.round(beat.start * FPS)} durationInFrames={Math.max(1, Math.round((beat.end - beat.start) * FPS))}>
        <Card beat={beat} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
