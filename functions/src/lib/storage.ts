class Upserter<T> {
  private t:FirebaseFirestore.Transaction
  private docRef:FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
  constructor(docRef:FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, t:FirebaseFirestore.Transaction) {
    this.docRef = docRef;
    this.t = t;
  }

  async upsert(build:()=>T, update:(data:any)=>any) {
    const docSnapshot = await this.docRef.get(); // トランザクションから取るとエラー（先に全部取っておかないとダメか？）

    if(docSnapshot.exists) {
      const data = docSnapshot.data();
      if(data !== null) {
        await this.t.set(this.docRef, update(data), {merge: true})
      } else {
        throw new Error(`data not found: ${docSnapshot}`);
      }
    } else {
      await this.t.set(this.docRef, build());
    }
  }
}

export {Upserter}
