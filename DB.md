## 1. DDL 실습 (테이블 생성 및 수정)

### **문제 1: 테이블 생성하기 (CREATE TABLE)**

**Q1-1. `attendance` 테이블은 중복된 데이터가 쌓이는 구조이다. 중복된 데이터는 어떤 컬럼인가?**
* **A.** 현재 `attendance` 테이블 구조에서는 `nickname` 컬럼이 중복되고 있습니다. 한 크루가 여러 번 출석할 때마다 매번 같은 아이디와 닉네임이 반복적으로 저장되고 있습니다.

**Q1-2. `attendance` 테이블에서 중복을 제거하기 위해 `crew` 테이블을 만들려고 한다. 어떻게 구성해 볼 수 있을까?**
* **A.** 크루의 정보를 담는 `crew` 테이블을 설계합니다.
    * `crew_id`: 기본키
    * `nickname`: 크루의 닉네임

**Q1-3. `crew` 테이블에 들어가야 할 크루들의 정보는 어떻게 추출할까? (hint: DISTINCT)**
```sql
SELECT DISTINCT crew_id, nickname
FROM attendance;
```

**Q1-4. 최종적으로 crew 테이블 생성**
```sql
CREATE TABLE crew (
    crew_id INT NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    PRIMARY KEY (crew_id)
);
```

**Q1-5. attendance 테이블에서 크루 정보를 추출해서 crew 테이블에 삽입하기**
```sql
INSERT INTO crew (crew_id, nickname)
SELECT DISTINCT crew_id, nickname
FROM attendance;
```

### **문제 2: 테이블 컬럼 삭제하기 (ALTER TABLE)**

**Q2-1. crew 테이블을 만들고 중복을 제거했다. attendance에서 불필요해지는 컬럼은?**
* **A.** `nickname` 컬럼이 불필요해집니다.

**Q2-2. 컬럼을 삭제하려면 어떻게 해야 하는가?**
```sql
ALTER TABLE attendance DROP COLUMN nickname;
```

### **문제 3: 외래키 설정하기 (FOREIGN KEY)**

**Q. 만약에 crew 테이블에는 crew_id가 12번인 크루가 존재하지 않지만, attendance 테이블에는 여전히 crew_id가 12번인 크루가 존재한다면? (예: 해당 크루가 중간에 퇴소했거나 누군가의 실수에 의해 레코드가 삭제되었거나)**
* **A.** crew 테이블에는 없는 ID가 attendance 테이블에 남아 있다면, 해당 출석 기록은 누구의 기록인지 알 수 없는 유령 데이터가 됩니다. 이를 방지하기 위해 attendance 테이블의 crew_id가 crew 테이블의 crew_id를 참조하도록 **외래키**를 설정해야 합니다.

```sql
ALTER TABLE attendance
ADD CONSTRAINT fk_attendance_crew
FOREIGN KEY (crew_id) REFERENCES crew(crew_id);
```

### **문제 4: 유니크 키 설정 (UNIQUE)**

**Q. 우아한테크코스에서는 닉네임의 '중복'이 엄연히 금지된다. 그런데 현재 테이블에는 중복된 닉네임이 담길 수 있다. crew 테이블의 결함을 어떻게 해결할 수 있을까?**
```sql
ALTER TABLE crew
ADD CONSTRAINT uk_nickname UNIQUE (nickname);
```

## 2. DML (CRUD) 실습

### **문제 5: 크루 닉네임 검색하기 (LIKE)**

**Q. 3월 4일, 아침에 검프에게 어떤 크루가 상냥하게 인사했다. 그런데 검프도 구면인 것 같아서 닉네임 첫 글자가 '디'라는 건 떠올랐는데... 누구지?**
```sql
SELECT crew_id, nickname 
FROM crew 
WHERE nickname LIKE '디%';
```

### **문제 6: 출석 기록 확인하기 (SELECT + WHERE)**

**Q. 성실의 아이콘 어셔는 등굣길에 스마트폰을 떨어뜨리는 바람에 3월 6일에 등교/하교 버튼을 누르지 못했다. 일단, 정말로 어셔의 기록이 누락됐는지부터 확인해 보자.**
```sql
SELECT a.*
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
WHERE c.nickname = '어셔'
  AND a.attendance_date = '2025-03-06';
```

### **문제 7: 누락된 출석 기록 추가 (INSERT)**

**Q. 확인해 보니, 어셔는 그날 출석 체크를 하지 못한 것이 사실로 드러났다. 사후 처리를 위해 출석을 추가해야 하는데 어떻게 추가해야 할까?**
```sql
INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (13, '2025-03-06', '09:31:00', '18:01:00');
```

### **문제 8: 잘못된 출석 기록 수정 (UPDATE)**

**Q. 주니는 3월 12일 10시 정각에 캠퍼스에 도착했지만 깜빡하고 10시 5분에 등교 버튼을 눌렀다. 한 번만 출석 처리를 해주기 위해 10시 정각으로 수정하려면?**
```sql
UPDATE attendance
SET start_time = '10:00:00'
WHERE crew_id = (SELECT crew_id FROM crew WHERE nickname = '주니')
  AND attendance_date = '2025-03-12';
```

### **문제 9: 허위 출석 기록 삭제 (DELETE)**

**Q. 아론이 3월 12일에 캠퍼스에 도착하지 않았는데 출석 처리가 되어 있다. 해당 기록을 지우려면?**
```sql
DELETE FROM attendance
WHERE crew_id = (SELECT crew_id FROM crew WHERE nickname = '아론')
  AND attendance_date = '2025-03-12';
```

## 3. 심화 및 집계 쿼리 실습

### **문제 10: 출석 정보 조회하기 (JOIN)**

**Q. crew 테이블에서 crew_id를 기준으로 nickname 필드 값을 가져와서 함께 조회할 수도 있지 않을까?**
```sql
SELECT
    c.nickname,
    a.attendance_date,
    a.start_time,
    a.end_time
FROM attendance AS a
JOIN crew AS c ON a.crew_id = c.crew_id;
```

### **문제 11: nickname으로 쿼리 처리하기 (서브 쿼리)**

**Q. nickname을 입력하면 이를 기준으로 쿼리문을 처리할 수도 있지 않을까?**
```sql
SELECT a.*
FROM attendance a
WHERE crew_id = (
    SELECT c.crew_id
    FROM crew c
    WHERE c.nickname = '검프'
);
```

### **문제 12: 가장 늦게 하교한 크루 찾기**

**Q. 전날(3월 5일) 가장 늦게 하교한 크루를 찾아 DM을 보내려고 하는데 크루의 닉네임과 하교 시각은 어떻게 찾을 수 있을까?**
```sql
SELECT
    c.nickname,
    a.end_time
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
WHERE a.attendance_date = '2025-03-05'
ORDER BY a.end_time DESC
LIMIT 1;
```

### **문제 13: 크루별로 '기록된' 날짜 수 조회**
```sql
SELECT
    c.nickname,
    COUNT(a.attendance_id) AS attendance_count
FROM crew c
LEFT JOIN attendance a ON c.crew_id = a.crew_id
GROUP BY c.crew_id, c.nickname;
```

### **문제 14: 크루별로 등교 기록이 있는(start_time IS NOT NULL) 날짜 수 조회**
```sql
SELECT
    c.nickname,
    COUNT(a.start_time) AS present_days
FROM crew c
JOIN attendance a ON c.crew_id = a.crew_id
WHERE a.start_time IS NOT NULL
GROUP BY c.crew_id, c.nickname;
```

### **문제 15: 날짜별로 등교한 크루 수 조회**
```sql
SELECT
    attendance_date,
    COUNT(start_time) AS daily_crew_count
FROM attendance
WHERE start_time IS NOT NULL
GROUP BY attendance_date
ORDER BY attendance_date ASC;
```

### **문제 16: 크루별 가장 빠른 등교 시각(MIN)과 가장 늦은 등교 시각(MAX)**
```sql
SELECT 
    c.nickname, 
    MIN(a.start_time) AS earliest_start, 
    MAX(a.start_time) AS latest_start
FROM crew c
JOIN attendance a ON c.crew_id = a.crew_id
WHERE a.start_time IS NOT NULL
GROUP BY c.crew_id, c.nickname;
```
