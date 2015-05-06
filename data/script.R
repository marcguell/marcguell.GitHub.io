library(rjson)

ins2json=cbind(blocks.20.70.ins,as.character(seqs.i))
rownames(ins2json)=blocks.20.70.ins[,1]
colnames(ins2json)=c("id","blockSize1","blockSize2","queryStart1","queryStart2","templateStart","templateStart2","match","seq")

ins2vec=vector(length=dim(ins2json)[1])
for (i in 1:dim(ins2json)[1]){
        ins2vec[i]=list(ins2json[i,])
}


dels2json=cbind(blocks.20.70.dels,as.character(seqs.d))
rownames(dels2json)=blocks.20.70.dels[,1]
colnames(dels2json)=c("id","blockSize1","blockSize2","queryStart1","queryStart2","templateStart","templateStart2","match","seqs")


dels2vec=vector(mode="list",length=dim(dels2json)[1])
for (i in 1:dim(dels2json)[1]){
        dels2vec[i]=list(dels2json[i,])
}




json_data=list(HR=HR, NHEJ=NHEJ,deletions=apply(dels2json,1,function(X) return(list(c(X[1:9])))),insertions=apply(ins2json,1,function(X) return(list(c(X[1:9])))))


write(toJSON(json_data),file="data2.json")


