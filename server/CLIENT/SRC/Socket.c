#include "../INCLUDE/IncludeAllSRC.h"

// Client //
void CreateSocket(int * sockfd, const char * ip, int port, struct sockaddr_in * interface_addr){

    *sockfd = socket(AF_INET, SOCK_STREAM, 0);

    if (*socket < 0) {
        printf("[System] : Erreur lors de la création du socket\n");
        exit(EXIT_FAILURE);
    }else{
        printf("[System] : Création du socket avec succès...\n");
    }

        // Initialisation de la structure "serv_addr" à 0.
    memset(&(*interface_addr), 0, sizeof(*interface_addr));

        // Famille d'adresses internet (IP).
    (*interface_addr).sin_family = AF_INET;

        // Numéro de port converti en format de réseau
    (*interface_addr).sin_port = htons(port);

        // Conversion de l'adresse IP en format de réseau
    if (inet_pton(AF_INET, ip, &(*interface_addr).sin_addr) <= 0) {
        printf("[System] : Erreur lors de la conversion de l'adresse IP : %s\n", ip);
    }
}


void ConnectToServer(int *sockfd, struct sockaddr_in *server_addr){
    if (connect(*sockfd, (struct sockaddr *)server_addr, sizeof(*server_addr)) < 0){
        printf("[System] : Échec de la connexion au serveur\n");
        exit(EXIT_FAILURE);
    }
    else{
        printf("[System] : Connexion au serveur établie avec succès...\n");
    }
}

void CloseSocket(int *sockfd){
    if(close(*sockfd) == 0){
        printf("[System] : Fermeture du socket avec succès...\n");
    }else{
        printf("[System] : Erreur lors de la fermeture du socket\n");
    }

}

