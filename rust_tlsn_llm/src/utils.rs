
/// Find the ranges of the public and private parts of a sequence.
///
/// Returns a tuple of `(public, private)` ranges.
fn find_ranges(seq: &[u8], sub_seq: &[&[u8]]) -> (RangeSet<usize>, RangeSet<usize>) {
  let mut private_ranges = Vec::new();
  for s in sub_seq {
      for (idx, w) in seq.windows(s.len()).enumerate() {
          if w == *s {
              private_ranges.push(idx..(idx + w.len()));
          }
      }
  }

  let mut sorted_ranges = private_ranges.clone();
  sorted_ranges.sort_by_key(|r| r.start);

  let mut public_ranges = Vec::new();
  let mut last_end = 0;
  for r in sorted_ranges {
      if r.start > last_end {
          public_ranges.push(last_end..r.start);
      }
      last_end = r.end;
  }

  if last_end < seq.len() {
      public_ranges.push(last_end..seq.len());
  }

  (
      RangeSet::from(public_ranges),
      RangeSet::from(private_ranges),
  )
}

/// Finds text between two marker words in a string and returns both the text
/// and its position as a RangeSet.
/// 
/// # Arguments
/// * `input` - The input string to search
/// * `first_word` - The starting marker word
/// * `last_word` - The ending marker word
fn find_text_between(input: &str, first_word: &str, last_word: &str) -> Option<(String, RangeSet<usize>)> {
  let first_pos = input.find(first_word)?;
  let last_pos = input.rfind(last_word)?;
  
  if last_pos < first_pos {
      return None;
  }
  
  let start = first_pos;
  let end = last_pos;
  let text = input[start..end].to_string();
  
  Some((text, RangeSet::from([start..end])))
}
