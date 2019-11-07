# aeproject env

## Start your local development node along with a compiler

```text
aeproject env
```

The command is responsible for setting up a healthy local node. The **env** command help developers run their local network, as well as local compiler on docker. The local network contains 3 nodes. To spawn a fully functional network takes couple of minutes. At the end of this command you will be presented with accounts that you can use in your unit tests.


### If you are running on Windows environment and it is before `Windows 10` 
* You need to start manualy your `Docker Quickstart Terminal`. 
* Optional parameter **\-\-windows** allows you run AE node and compiler with predefined configuration. It uses **docker-compose** cli commands and it starts with the default docker machine with IP "192.168.99.100"

```text
aeproject env --windows
```
* if docker default machine IP is running on different IP, you can set it by **\-\-docker-ip** optional parameter. Default IP is "192.168.99.100"
```text
aeproject env --windows --docker-ip 192.168.99.100


Together with AE node `env` command run a local compiler that response at `http://localhost:3080` If you want to run only AE node, you should type 

```text
aeproject node
```

You can stop both the node and the compiler by running `aeproject env --stop`
```text
aeproject env --stop
```

To see whether you have running instances of the nodes along with a compiler you could run the following command
```text
aeproject env --info
```

**Attention**: there will be an error if you are trying to run the command while only one of the compoler or nodes are running. Then you should type the appropriate **info** command.


### Disclaimer
Please note that in rare occurrences you may experience some delay, or even timeout exception while trying to run the node. This usually happens due to new version of the docker images which the docker is trying to pull, or possibly could happen after updating the aeproject verson with new node/compiler version. The files may be large or connection inconsistency may occur. Please try to run ``` docker pull ``` or simply retry to run ```aeproject node``` again. 