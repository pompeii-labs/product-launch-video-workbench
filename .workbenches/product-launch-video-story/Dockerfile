# Runtime image for the product-launch-video Workbench.
#
# Contract (Workbench standard): runs as any numeric user with a read-only root filesystem;
# HOME and /tmp are writable but noexec, so everything installs here at build time,
# world-readable. Nothing is downloaded at run time except web fonts (snapcn components
# load theirs from Google Fonts while rendering).
#
# Base: Microsoft's Playwright image ships Node 24, full Chromium (lvcapture screenshots the
# live product with it), and the system libraries and fonts a headless browser needs, which
# Remotion's own headless Chrome shares.

FROM mcr.microsoft.com/playwright:v1.60.0-noble

ARG OPENCODE_VERSION=1.18.26

# ffmpeg/ffprobe: lvcheck's media checks (blackdetect, freezedetect) and evidence sheets.
# fonts-dejavu-core: captions on contact sheets. ripgrep: OpenCode skill discovery.
# git and tar: e2b and daytona stage the workspace with them.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core ripgrep git tar \
    && rm -rf /var/lib/apt/lists/*

# The runner.
RUN npm install -g opencode-ai@${OPENCODE_VERSION} \
    && chmod -R a+rX "$(npm root -g)"

# The bench tools and the Remotion project template with its dependencies prebuilt.
# lvnew links each video's node_modules to the template's, so runs need no npm install.
# `remotion browser ensure` bakes Remotion's headless Chrome into that node_modules.
COPY tools/ /opt/launch-video/tools/
RUN cd /opt/launch-video/tools/share && npm ci --no-audit --no-fund \
    && cd /opt/launch-video/tools/share/template && npm ci --no-audit --no-fund \
    && npx remotion browser ensure \
    && rm -rf /root/.npm \
    && chmod -R a+rX /opt/launch-video \
    && chmod a+x /opt/launch-video/tools/bin/* \
    && ln -s /opt/launch-video/tools/bin/* /usr/local/bin/

COPY skills/ /opt/launch-video/skills/
RUN chmod -R a+rX /opt/launch-video/skills

ENV LV_HOME=/opt/launch-video/tools \
    LV_SANDBOX=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    REMOTION_DISABLE_TELEMETRY=1 \
    CI=1

WORKDIR /workspace
