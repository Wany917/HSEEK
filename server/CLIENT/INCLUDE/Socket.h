 #ifndef Socket_h
 #define Socket_h



void CreateSocket(int * sockfd, const char * ip, int port, struct sockaddr_in * interface_addr);
void ConnectToServer(int *sockfd, struct sockaddr_in *server_addr);
void CloseSocket(int *sockfd);
/*void SendInformationSocket(int client_socket, UserInformation Info);
void RecvInformationSocket(int client_socket, UserInformation *Info); */

 #endif