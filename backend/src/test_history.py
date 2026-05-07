from util.database import SessionLocal 
# soft_delete_all_user_history 임포트 추가
from model.history_handler import (
    insert_search_query, 
    get_user_search_histories, 
    soft_delete_history,
    soft_delete_all_user_history  
)
from model.user_handler import get_user

def print_history_menu():
    print("\n" + "="*35)
    print("   [검색 기록(History) 테스트 메뉴]   ")
    print("="*35)
    print("1. 검색 기록 추가 (Insert)")
    print("2. 유효 검색 목록 조회 (Read - del_yn='N')")
    print("3. 특정 기록 소프트 삭제 (Delete - 'Y'로 변경)")
    print("4. 전체 기록 현황 확인 (전체 개수)")
    print("5. 유저 전체 기록 일괄 삭제 (Soft Delete All)") # 새 메뉴 추가
    print("0. 테스트 종료")
    print("="*35)

def run_interactive_history_test():
    db = SessionLocal()
    target_username = "testuser5" 
    
    try:
        user = get_user(db, username=target_username)
        if not user:
            print(f"❌ 오류: '{target_username}' 유저가 DB에 없습니다. 유저 생성을 먼저 하세요.")
            return

        print(f"✅ 테스트 타겟 확인: {user.full_name} (ID: {user.id})")

        while True:
            print_history_menu()
            choice = input("실행할 단계의 번호를 입력하세요: ")

            if choice == '1':
                q_text = input("검색어를 입력하세요 (기본: '서울대공원'): ") or "서울대공원"
                new_h = insert_search_query(db, user_id=user.id, query=q_text)
                print(f"🔹 [성공] 기록 ID {new_h.id} 생성 완료!")

            elif choice == '2':
                print(f"\n[조회] '{user.full_name}'님의 유효 기록들:")
                history_list = get_user_search_histories(db, user_id=user.id)
                if not history_list:
                    print("⚠️ 현재 표시할 검색 기록이 없습니다.")
                for h in history_list:
                    print(f" - [ID: {h.id}] {h.search_query} (시간: {h.created_at})")

            elif choice == '3':
                h_id = input("소프트 삭제할 기록의 ID를 입력하세요: ")
                if h_id.isdigit():
                    is_deleted = soft_delete_history(db, history_id=int(h_id))
                    if is_deleted:
                        print(f"✅ [성공] 기록 ID {h_id}가 삭제 되었습니다.")
                    else:
                        print("❌ [실패] 해당 ID의 기록을 찾을 수 없습니다.")

            elif choice == '4':
                from table import SearchHistory
                all_h = db.query(SearchHistory).filter(SearchHistory.user_id == user.id).all()
                print(f"\n📊 [통계] 전체 데이터 개수: {len(all_h)}개")
                for h in all_h:
                    status = "삭제됨(Y)" if h.del_yn == 'Y' else "유효(N)"
                    print(f" - ID {h.id}: {h.search_query} [{status}]")

            elif choice == '5':
                confirm = input(f"⚠️ 정말로 '{user.full_name}'님의 모든 검색 기록을 삭제하시겠습니까? (y/n): ")
                if confirm.lower() == 'y':
                    # CRUD 함수 호출
                    success = soft_delete_all_user_history(db, user_id=user.id)
                    if success:
                        print(f"✅ [성공] {user.full_name}님의 모든 검색 기록이 소프트 삭제되었습니다.")
                        print("💡 Tip: 4번 메뉴를 눌러 모든 기록의 상태가 [삭제됨(Y)]으로 바뀌었는지 확인하세요.")
                    else:
                        print("❌ [실패] 삭제 처리 중 오류가 발생했습니다.")
                else:
                    print("🚫 삭제 작업이 취소되었습니다.")

            elif choice == '0':
                print("👋 히스토리 테스트를 종료합니다.")
                break
            else:
                print("⚠️ 잘못된 입력입니다.")

    except Exception as e:
        print(f"🔥 에러 발생: {e}")
        db.rollback()
    finally:
        db.close()
        print("\n🏁 DB 연결 종료")

if __name__ == "__main__":
    run_interactive_history_test()