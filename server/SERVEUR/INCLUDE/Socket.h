 #ifndef Socket_h
 #define Socket_h

void CreateSocket(int * sockfd, const char * ip, int port, struct sockaddr_in * interface_addr);
void ListenSocket(int * sockfd, int max_connexion);
void CloseSocket(int *sockfd, int client_socket);
void AcceptSocket(int sockfd, struct sockaddr_in *client_addr, socklen_t client_len, int *client_socket);
void Recv(int client_socket);
#endif