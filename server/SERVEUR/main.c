#include "./INCLUDE/IncludeMain.h"


int main() {
    
    // Acceptation des connexions entrantes sur l'adresse IP et le PORT spécifié

    // Initialisation des variables

    int sockfd, client_socket;
    struct sockaddr_in serv_addr, client_addr;

    // Création du socket

    CreateSocket(&sockfd, SERVEUR_IP, PORT, &serv_addr);

    // Mise en écoute du serveur

    ListenSocket(&sockfd, MAX_CONNEXION);

    socklen_t client_len = sizeof(client_addr);

    // Acceptation de la connexion avec le serveur
    AcceptSocket(sockfd, &client_addr, client_len, &client_socket);
    printf("Lecture en cours...\n");
    Recv(client_socket);

    // Fermeture du socket

    CloseSocket(&sockfd, sockfd);

    return 0;
}
