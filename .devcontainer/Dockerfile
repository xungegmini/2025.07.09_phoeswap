# Krok 1: Zaczynamy od czystej, standardowej bazy Ubuntu 22.04
FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-22.04

# Krok 2: Zainstaluj wszystkie niezbędne zależności systemowe za jednym zamachem
# To naprawia problemy z OpenSSL, Protobuf i innymi narzędziami
USER root
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    pkg-config \
    build-essential \
    libssl-dev \
    libudev-dev \
    git \
    curl \
    protobuf-compiler

# Krok 3: Przełącz się na domyślnego użytkownika kontenera
USER vscode
WORKDIR /home/vscode

# Krok 4: Zainstaluj Rust i Cargo
# Dodajemy --no-modify-path, aby uniknąć problemów z interaktywnymi promptami
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
ENV PATH="/home/vscode/.cargo/bin:${PATH}"

# Krok 5: Zainstaluj Solana CLI i dodaj do PATH
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.18.14/install)"
ENV PATH="/home/vscode/.local/share/solana/install/active_release/bin:${PATH}"

# Krok 6: Zainstaluj AVM i ustaw poprawną wersję Anchor
RUN cargo install avm && \
    /home/vscode/.cargo/bin/avm install 0.30.1 && \
    /home/vscode/.cargo/bin/avm use 0.30.1
ENV PATH="/home/vscode/.avm/bin:${PATH}"

# Krok końcowy: Upewnij się, że powłoka bash będzie używana domyślnie
CMD [ "bash" ]