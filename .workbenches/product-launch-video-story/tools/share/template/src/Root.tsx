import React from "react";
import { Composition } from "remotion";
import manifest from "../manifest.json";
import { LaunchVideo } from "./LaunchVideo";
import { LvProbe } from "./lv/Probe";

// The gate reads this composition. Its id, canvas, and fps are fixed; its length comes from manifest.json.
export const FPS = 30;

const Probed: React.FC = () => (
  <LvProbe>
    <LaunchVideo />
  </LvProbe>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="LaunchVideo"
    component={Probed}
    durationInFrames={Math.round(manifest.durationSeconds * FPS)}
    fps={FPS}
    width={1280}
    height={720}
  />
);
