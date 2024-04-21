#include "./INCLUDE/IncludeMain.h"
#define BUFFER_SIZE 1024 * 1024 * 500

int main(int argc, char const *argv[]) {

    char *buffer = malloc(BUFFER_SIZE);
    // Initialisation des variables pour gérer les sockets

    int sockfd;
    struct sockaddr_in interface_addr;

    // Initialisation et création du socket 
    CreateSocket(&sockfd, SERVEUR_IP, PORT, &interface_addr);

    // Connexion au serveur
    ConnectToServer(&sockfd, &interface_addr);

    FILE * file = fopen("PYTHON2.zip", "rb");
    printf("Envoi en cours...");
    while(1){
        int bytes_read = fread(buffer, 1, BUFFER_SIZE, file);
        if (bytes_read == 0) {
            printf("\nFichier vide\n");
            break; // Fin de la lecture du fichier
        }
        printf(".");
        send(sockfd, buffer, bytes_read, 0);
    }
    fclose(file);
    // Fermeture du serveur //
    CloseSocket(&sockfd);

    return 0;
}