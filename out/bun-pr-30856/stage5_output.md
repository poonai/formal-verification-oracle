no bug found

The proof result reports a missing Dafny spec/model limitation, not the MySQL YEAR over-read bug. It only proves fallback behavior for `MYSQL_TYPE_OTHER` and cannot express `MYSQL_TYPE_YEAR`, so it does not actually target or demonstrate the intended YEAR length-prefixed overread.
