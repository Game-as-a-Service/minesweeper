import * as bcrypt from 'bcrypt';
/**
 * 使用者註冊時，將密碼明文(plain)轉成雜湊碼(hash)
 * @param plain 使用者輸入的密碼明文(plain)
 * @return 回傳雜湊碼(hash)，可以儲值在資料庫
 */
export const hash = async function (plain: string): Promise<string> {
  const saltOrRounds = 10;

  return await bcrypt.hash(plain, saltOrRounds);
};

/**
 * 使用者登入時，比對密碼是否一致
 * @param plain 使用者輸入的密碼明文(plain)
 * @param hash 資料庫儲存的雜湊碼(hash)
 * @return 比對結果
 */
export const compare = async function (
  plain: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
};
