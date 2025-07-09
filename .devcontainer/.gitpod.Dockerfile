FROM gitpod/workspace-full

# Instalacja wszystkich niezbędnych zależności systemowych
USER root
RUN sudo apt-get update && sudo apt-get install -y build-essential pkg-config libssl-dev libudev-dev

# Przełącz z powrotem na domyślnego użytkownika
USER gitpod