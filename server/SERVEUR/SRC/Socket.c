#include "../INCLUDE/IncludeAllSRC.h"


// Serveur //
void CreateSocket(int * sockfd, const char * ip, int port, struct sockaddr_in * interface_addr){

    int reuse = 1;

    *sockfd = socket(AF_INET, SOCK_STREAM, 0);

    if (*sockfd < 0) {
        printf("[System] : Erreur lors de la création du socket\n");
        exit(EXIT_FAILURE);
    }else{
        printf("[System] : Création du socket avec succès...\n");
    }

    setsockopt(*sockfd, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse));

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
    if (bind(*sockfd, (struct sockaddr *) &(*interface_addr), sizeof(*interface_addr)) < 0) {
        printf("[System] : Erreur lors du binding\n");
        exit(EXIT_FAILURE);
    }else{
        printf("[System] : Binding entre l'adresse IP: %s et le PORT : %d\n", ip, port);
    }
}


void ListenSocket(int * sockfd, int max_connexion){
    if(listen(*sockfd, max_connexion) >= 0){ 
        printf("[System] : Socket en écoute ( %d connexions maximales)\n", max_connexion);
    }else{
        printf("[System] : Erreur lors de l'écoute du Socket\n");
    }
}

void AcceptSocket(int sockfd, struct sockaddr_in *client_addr, socklen_t client_len, int *newsockfd){
    *newsockfd = accept(sockfd, (struct sockaddr *)client_addr, &client_len);
    if (*newsockfd >= 0){
        printf("[System] : Connexion client acceptée de %s:%d\n", inet_ntoa(client_addr->sin_addr), ntohs(client_addr->sin_port));
    }else{
        printf("[System] : Erreur lors de l'acceptation de la connexion client\n");
    }
}

void Send(){

}

void Recv(int client_socket){
    FILE * file = fopen("PYTHON2.zip", "w");
    const size_t BUFFER_SIZE = 1024 * 1024 * 500;
    char *buffer = malloc(BUFFER_SIZE);
    if (buffer == NULL) {
        fprintf(stderr, "Erreur d'allocation de mémoire\n");
        exit(EXIT_FAILURE);
    }
    int bytes_received = recv(client_socket, buffer, BUFFER_SIZE, 0);
    printf("%d\n", bytes_received);
    fwrite(buffer, 1, bytes_received, file);
}
    
    

void CloseSocket(int *sockfd, int ){
    struct sockaddr_in sock_addr;
    socklen_t sock_addr_len = sizeof(sock_addr);
    if (getsockname(*sockfd, (struct sockaddr *) &sock_addr, &sock_addr_len) == -1) {
        printf("[System] : Erreur lors de la récupération de l'adresse du socket\n");
        return;
    }

    if(close(*sockfd) == 0){
        printf("[System] : Fermeture du socket avec succès de %s:%d\n", inet_ntoa(sock_addr.sin_addr), ntohs(sock_addr.sin_port));
    }else{        
        printf("[System] : Erreur lors de la fermeture du socket de %s:%d\n", inet_ntoa(sock_addr.sin_addr), ntohs(sock_addr.sin_port));
    }
}

