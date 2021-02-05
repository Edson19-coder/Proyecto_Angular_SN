export class Publication{
	constructor(
		public _id: string, 
		public text: string, 
		public file: string, 
		public createDate: string, 
		public user: string 
		){}
}