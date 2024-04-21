#ifndef Main_h
#define Main_h

// Partie inclusion des bibliothèques //

#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <pthread.h>
#include <stdlib.h>
#include <stdbool.h>

// Partie inclusion des bibliothèques privées //


#include "./Socket.h"

// Partie initialisation réseau //

#define PORT 41000
#define SERVEUR_IP "127.0.0.1"
#define MAX_CONNEXION 10

// Partie Initialisation chemin //

#endif